-- ============================================
-- Second School — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL)
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. PROFILES (extends Supabase Auth)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'teacher', 'student')) default 'student',
  staff_status text not null check (staff_status in ('none', 'pending', 'approved', 'rejected')) default 'none',
  head_requested boolean not null default false,
  full_name text not null,
  email text,
  phone text,
  avatar_url text,
  branch_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 2. BRANCHES
-- ============================================
create table public.branches (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  is_main boolean default false,
  created_at timestamptz default now()
);

-- Add FK after branches table exists
alter table public.profiles add constraint profiles_branch_fk foreign key (branch_id) references public.branches(id);

-- ============================================
-- 3. TEACHERS
-- ============================================
create table public.teachers (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  subject text not null,
  experience int default 0,
  qualification text,
  rating numeric(2,1),
  about text,
  branch_id uuid references public.branches(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 4. STUDENTS
-- ============================================
create table public.students (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete set null,
  student_code text unique not null,
  name text not null,
  class text not null,
  school text,
  parent_contact text,
  address text,
  fee_status text default 'Due' check (fee_status in ('Paid', 'Due', 'Overdue')),
  branch_id uuid references public.branches(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 5. ATTENDANCE
-- ============================================
create table public.attendance (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  date date not null default current_date,
  status text not null check (status in ('Present', 'Absent', 'Leave')),
  marked_by uuid references public.teachers(id),
  created_at timestamptz default now(),
  unique(student_id, date)
);

-- ============================================
-- 6. SUBJECTS
-- ============================================
create table public.subjects (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  created_at timestamptz default now()
);

-- No seeded subjects: each centre adds its own.

-- ============================================
-- 7. TESTS & RESULTS
-- ============================================
create table public.tests (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  subject_id uuid not null references public.subjects(id),
  class text not null,
  max_marks int not null default 50,
  date date not null default current_date,
  created_by uuid references public.teachers(id),
  created_at timestamptz default now()
);

create table public.results (
  id uuid primary key default uuid_generate_v4(),
  test_id uuid not null references public.tests(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  marks int not null,
  created_at timestamptz default now(),
  unique(test_id, student_id)
);

-- ============================================
-- 8. ASSIGNMENTS
-- ============================================
create table public.assignments (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subject_id uuid references public.subjects(id),
  class text not null,
  due_date date not null,
  instructions text,
  created_by uuid references public.teachers(id),
  created_at timestamptz default now()
);

create table public.assignment_submissions (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  submitted_at timestamptz default now(),
  unique(assignment_id, student_id)
);

-- ============================================
-- 9. FEES
-- ============================================
create table public.fees (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  amount numeric(10,2) not null,
  period text not null,
  due_date date not null,
  paid_date date,
  status text not null default 'Due' check (status in ('Paid', 'Due', 'Overdue')),
  created_at timestamptz default now()
);

-- ============================================
-- 10. MEETINGS
-- ============================================
create table public.meetings (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  meeting_type text,
  date date not null,
  time text,
  description text,
  created_by uuid references public.teachers(id),
  branch_id uuid references public.branches(id),
  created_at timestamptz default now()
);

-- ============================================
-- 11. REMINDERS
-- ============================================
create table public.reminders (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('Test', 'Absence', 'Fee', 'Homework')),
  message text not null,
  target_class text,
  sent_by uuid references public.teachers(id),
  created_at timestamptz default now()
);

-- ============================================
-- 12. NOTIFICATIONS (student-facing)
-- ============================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null,
  detail text,
  icon text default '🔔',
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- 13. TIMETABLE
-- ============================================
create table public.timetable (
  id uuid primary key default uuid_generate_v4(),
  day text not null check (day in ('Mon','Tue','Wed','Thu','Fri','Sat')),
  start_time text not null,
  end_time text not null,
  subject text not null,
  class text not null,
  room text,
  teacher_id uuid references public.teachers(id),
  branch_id uuid references public.branches(id),
  created_at timestamptz default now()
);

-- ============================================
-- 14. SUBSCRIPTIONS (for tuition centre billing)
-- ============================================
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid not null references public.branches(id),
  plan text not null check (plan in ('Monthly', 'Half-yearly', 'Yearly')),
  price numeric(10,2) not null,
  starts_at date not null default current_date,
  renews_at date not null,
  status text default 'active' check (status in ('active', 'cancelled', 'expired')),
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.branches enable row level security;
alter table public.teachers enable row level security;
alter table public.students enable row level security;
alter table public.attendance enable row level security;
alter table public.subjects enable row level security;
alter table public.tests enable row level security;
alter table public.results enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.fees enable row level security;
alter table public.meetings enable row level security;
alter table public.reminders enable row level security;
alter table public.notifications enable row level security;
alter table public.timetable enable row level security;
alter table public.subscriptions enable row level security;

-- Profiles: users can read all, update own
create policy "Profiles are viewable by authenticated" on public.profiles for select to authenticated using (true);
create policy "Users can update own profile" on public.profiles for update to authenticated using (id = auth.uid());
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());

-- Branches: readable by all authenticated
create policy "Branches are viewable" on public.branches for select to authenticated using (true);
create policy "Admins can manage branches" on public.branches for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Teachers: readable by all authenticated, writable by admin
create policy "Teachers are viewable" on public.teachers for select to authenticated using (true);
create policy "Admins can manage teachers" on public.teachers for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Students: readable by teachers/admin, own record by students
create policy "Staff can view all students" on public.students for select to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher'))
);
create policy "Students can view own record" on public.students for select to authenticated using (
  profile_id = auth.uid()
);
create policy "Staff can manage students" on public.students for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher'))
);

-- Attendance: staff can manage, students can view own
create policy "Staff can manage attendance" on public.attendance for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher'))
);
create policy "Students view own attendance" on public.attendance for select to authenticated using (
  student_id in (select id from public.students where profile_id = auth.uid())
);

-- Subjects: readable by all
create policy "Subjects are viewable" on public.subjects for select to authenticated using (true);

-- Tests & Results: staff manage, students view own
create policy "Staff can manage tests" on public.tests for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher'))
);
create policy "Tests are viewable" on public.tests for select to authenticated using (true);

create policy "Staff can manage results" on public.results for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher'))
);
create policy "Students view own results" on public.results for select to authenticated using (
  student_id in (select id from public.students where profile_id = auth.uid())
);

-- Assignments: staff manage, all authenticated can view
create policy "Staff manage assignments" on public.assignments for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher'))
);
create policy "Assignments are viewable" on public.assignments for select to authenticated using (true);

create policy "Students can submit" on public.assignment_submissions for insert to authenticated with check (
  student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Submissions viewable by staff" on public.assignment_submissions for select to authenticated using (true);

-- Fees: staff manage, students view own
create policy "Staff manage fees" on public.fees for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher'))
);
create policy "Students view own fees" on public.fees for select to authenticated using (
  student_id in (select id from public.students where profile_id = auth.uid())
);

-- Meetings: staff manage, all view
create policy "Staff manage meetings" on public.meetings for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher'))
);
create policy "Meetings are viewable" on public.meetings for select to authenticated using (true);

-- Reminders: staff only
create policy "Staff manage reminders" on public.reminders for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher'))
);
create policy "Reminders viewable" on public.reminders for select to authenticated using (true);

-- Notifications: students see own
create policy "Students view own notifications" on public.notifications for select to authenticated using (
  student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "Staff manage notifications" on public.notifications for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher'))
);

-- Timetable: all view, staff manage
create policy "Timetable is viewable" on public.timetable for select to authenticated using (true);
create policy "Staff manage timetable" on public.timetable for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher'))
);

-- Subscriptions: admin only
create policy "Admins manage subscriptions" on public.subscriptions for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- New Google sign-ins start UNREGISTERED (role 'student', staff_status 'none').
  -- They then register in-app as Head Teacher (only if none exists yet) or
  -- Teacher (which waits for head-teacher approval). Real students never sign
  -- in — they use a per-student code — so a signed-in 'student/none' profile
  -- is simply a staff member who hasn't registered yet.
  insert into public.profiles (id, full_name, email, role, staff_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'student',
    'none'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger teachers_updated_at before update on public.teachers for each row execute function public.set_updated_at();
create trigger students_updated_at before update on public.students for each row execute function public.set_updated_at();

-- ============================================
-- INDEXES
-- ============================================
create index idx_students_class on public.students(class);
create index idx_students_branch on public.students(branch_id);
create index idx_attendance_student_date on public.attendance(student_id, date);
create index idx_results_student on public.results(student_id);
create index idx_results_test on public.results(test_id);
create index idx_fees_student on public.fees(student_id);
create index idx_notifications_student on public.notifications(student_id);
create index idx_timetable_day on public.timetable(day);

-- ============================================
-- SEED DATA
-- ============================================
-- No seed data: a real centre starts empty and adds its own branches,
-- subjects, staff and students. (Demo branches were removed for production.)

-- ============================================================================
-- PRODUCTION MIGRATION — safe to run on an existing database (idempotent)
-- Run this whole block in the Supabase SQL Editor after the schema above.
-- ============================================================================

-- ---- Staff registration & approval columns (idempotent) --------------------
alter table public.profiles add column if not exists staff_status text
  not null default 'none';
alter table public.profiles drop constraint if exists profiles_staff_status_chk;
alter table public.profiles add constraint profiles_staff_status_chk
  check (staff_status in ('none', 'pending', 'approved', 'rejected'));
alter table public.profiles add column if not exists head_requested boolean
  not null default false;
alter table public.profiles alter column role set default 'student';

-- Helper: does an approved head teacher already exist?
create or replace function public.head_exists()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles where role = 'admin' and staff_status = 'approved');
$$;

-- Register the caller as Head Teacher — ONLY allowed if no head exists yet.
create or replace function public.register_as_head()
returns text language plpgsql security definer set search_path = public as $$
begin
  if public.head_exists() then
    raise exception 'A head teacher already exists. Ask them to grant you access.';
  end if;
  update public.profiles
    set role = 'admin', staff_status = 'approved', head_requested = false
    where id = auth.uid();
  return 'admin';
end; $$;

-- Register the caller as a Teacher — goes into 'pending' until head approves.
create or replace function public.register_as_teacher()
returns text language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
    set role = 'teacher',
        staff_status = case when staff_status = 'approved' then 'approved' else 'pending' end
    where id = auth.uid();
  return 'teacher';
end; $$;

-- An approved teacher asks to be promoted to head teacher.
create or replace function public.request_head()
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set head_requested = true
    where id = auth.uid() and role = 'teacher' and staff_status = 'approved';
end; $$;

-- Head-only: list all staff (teachers + heads) for the approvals screen.
create or replace function public.list_staff()
returns table (id uuid, full_name text, email text, role text, staff_status text, head_requested boolean, created_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and staff_status = 'approved') then
    raise exception 'Not authorized';
  end if;
  return query
    select p.id, p.full_name, p.email, p.role, p.staff_status, p.head_requested, p.created_at
    from public.profiles p
    where p.staff_status <> 'none'
    order by (p.staff_status = 'pending') desc, p.created_at desc;
end; $$;

-- Head-only mutations on staff members.
create or replace function public.approve_teacher(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and staff_status = 'approved') then
    raise exception 'Not authorized';
  end if;
  update public.profiles set role = 'teacher', staff_status = 'approved' where id = p_id;
end; $$;

create or replace function public.reject_teacher(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and staff_status = 'approved') then
    raise exception 'Not authorized';
  end if;
  update public.profiles set staff_status = 'rejected', head_requested = false where id = p_id;
end; $$;

create or replace function public.grant_head(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and staff_status = 'approved') then
    raise exception 'Not authorized';
  end if;
  update public.profiles set role = 'admin', staff_status = 'approved', head_requested = false where id = p_id;
end; $$;

create or replace function public.remove_staff(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and staff_status = 'approved') then
    raise exception 'Not authorized';
  end if;
  if p_id = auth.uid() then
    raise exception 'You cannot remove yourself';
  end if;
  update public.profiles set role = 'student', staff_status = 'rejected', head_requested = false where id = p_id;
end; $$;

revoke all on function public.head_exists() from public, anon;
revoke all on function public.register_as_head() from public, anon;
revoke all on function public.register_as_teacher() from public, anon;
revoke all on function public.request_head() from public, anon;
revoke all on function public.list_staff() from public, anon;
revoke all on function public.approve_teacher(uuid) from public, anon;
revoke all on function public.reject_teacher(uuid) from public, anon;
revoke all on function public.grant_head(uuid) from public, anon;
revoke all on function public.remove_staff(uuid) from public, anon;
grant execute on function public.head_exists() to authenticated;
grant execute on function public.register_as_head() to authenticated;
grant execute on function public.register_as_teacher() to authenticated;
grant execute on function public.request_head() to authenticated;
grant execute on function public.list_staff() to authenticated;
grant execute on function public.approve_teacher(uuid) to authenticated;
grant execute on function public.reject_teacher(uuid) to authenticated;
grant execute on function public.grant_head(uuid) to authenticated;
grant execute on function public.remove_staff(uuid) to authenticated;

-- ---- Role-aware RLS helpers + policy hardening -----------------------------
-- is_staff() = approved admin OR approved teacher; is_head() = approved admin.
-- Pending/rejected teachers and unregistered users get NOTHING.
create or replace function public.is_head()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and staff_status = 'approved');
$$;
create or replace function public.is_staff()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','teacher') and staff_status = 'approved');
$$;
revoke all on function public.is_head() from public, anon;
revoke all on function public.is_staff() from public, anon;
grant execute on function public.is_head() to authenticated;
grant execute on function public.is_staff() to authenticated;

-- Trigger functions are invoked by the trigger system, never called directly —
-- no role needs EXECUTE on them.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

-- profiles: read own row only; head teachers can read all (for approvals).
-- Role/status changes happen ONLY through the SECURITY DEFINER RPCs above.
drop policy if exists "Profiles are viewable by authenticated" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "profiles_select_self_or_head" on public.profiles;
create policy "profiles_select_self_or_head" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_head());

-- students: approved staff read; only head teachers write.
drop policy if exists "Staff can view all students" on public.students;
drop policy if exists "Staff can manage students" on public.students;
drop policy if exists "students_select_staff" on public.students;
drop policy if exists "students_write_head" on public.students;
create policy "students_select_staff" on public.students for select to authenticated using (public.is_staff());
create policy "students_write_head" on public.students for all to authenticated using (public.is_head()) with check (public.is_head());

-- Daily-update tables: any approved staff (head or teacher) may write.
drop policy if exists "Staff can manage attendance" on public.attendance;
create policy "attendance_staff" on public.attendance for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff can manage tests" on public.tests;
create policy "tests_staff" on public.tests for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff can manage results" on public.results;
create policy "results_staff" on public.results for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manage assignments" on public.assignments;
create policy "assignments_staff" on public.assignments for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manage reminders" on public.reminders;
create policy "reminders_staff" on public.reminders for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manage notifications" on public.notifications;
create policy "notifications_staff" on public.notifications for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manage timetable" on public.timetable;
create policy "timetable_staff" on public.timetable for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Head-only tables: staff records, fees, meetings, branches, subjects, billing.
drop policy if exists "Admins can manage teachers" on public.teachers;
create policy "teachers_head" on public.teachers for all to authenticated using (public.is_head()) with check (public.is_head());
drop policy if exists "Staff manage fees" on public.fees;
create policy "fees_head" on public.fees for all to authenticated using (public.is_head()) with check (public.is_head());
drop policy if exists "Staff manage meetings" on public.meetings;
create policy "meetings_head" on public.meetings for all to authenticated using (public.is_head()) with check (public.is_head());
drop policy if exists "Admins can manage branches" on public.branches;
create policy "branches_head" on public.branches for all to authenticated using (public.is_head()) with check (public.is_head());
drop policy if exists "subjects_head" on public.subjects;
create policy "subjects_head" on public.subjects for all to authenticated using (public.is_head()) with check (public.is_head());
drop policy if exists "Admins manage subscriptions" on public.subscriptions;
create policy "subscriptions_head" on public.subscriptions for all to authenticated using (public.is_head()) with check (public.is_head());

-- ---- Student code access (no login) ----------------------------------------
-- Returns ONLY the one student matching the code, with everything their app
-- needs. The code is the credential; this runs with definer rights so it
-- works for anonymous (not-signed-in) students without opening up the tables.
create or replace function public.get_student_snapshot(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_student public.students;
  v_result json;
begin
  if length(coalesce(p_code, '')) < 4 then
    return null;
  end if;

  select * into v_student from public.students where student_code = p_code;
  if v_student.id is null then
    return null;
  end if;

  select json_build_object(
    'student', json_build_object(
      'dbId', v_student.id,
      'name', v_student.name,
      'klass', v_student.class,
      'school', v_student.school,
      'code', v_student.student_code,
      'parent', v_student.parent_contact,
      'address', v_student.address,
      'feeStatus', v_student.fee_status
    ),
    'attendance', coalesce((
      select json_agg(json_build_object('date', a.date, 'status', a.status) order by a.date desc)
      from public.attendance a where a.student_id = v_student.id
    ), '[]'::json),
    'results', coalesce((
      select json_agg(json_build_object(
        'subject', s.name, 'test', t.name, 'date', t.date,
        'marks', r.marks, 'total', t.max_marks
      ) order by t.date desc)
      from public.results r
      join public.tests t on t.id = r.test_id
      join public.subjects s on s.id = t.subject_id
      where r.student_id = v_student.id
    ), '[]'::json),
    'fees', coalesce((
      select json_agg(json_build_object(
        'period', f.period, 'amount', f.amount, 'status', f.status,
        'dueDate', f.due_date, 'paidDate', f.paid_date
      ) order by f.due_date desc)
      from public.fees f where f.student_id = v_student.id
    ), '[]'::json),
    'notifications', coalesce((
      select json_agg(json_build_object(
        'title', n.title, 'detail', n.detail, 'icon', n.icon, 'createdAt', n.created_at
      ) order by n.created_at desc)
      from public.notifications n where n.student_id = v_student.id
    ), '[]'::json),
    'teachers', coalesce((
      select json_agg(json_build_object(
        'name', te.name, 'subject', te.subject, 'experience', te.experience,
        'qualification', te.qualification, 'rating', te.rating, 'about', te.about
      ) order by te.created_at desc)
      from public.teachers te
    ), '[]'::json),
    'rankings', coalesce((
      select json_object_agg(subject, arr)
      from (
        select subject, json_agg(json_build_array(name, pct) order by pct desc) as arr
        from (
          select s.name as subject, st.name as name,
            round(sum(r.marks)::numeric / nullif(sum(t.max_marks), 0) * 100)::int as pct
          from public.results r
          join public.tests t on t.id = r.test_id
          join public.subjects s on s.id = t.subject_id
          join public.students st on st.id = r.student_id
          group by s.name, st.name
        ) per_student
        group by subject
      ) ranked
    ), '{}'::json),
    'timetable', coalesce((
      select json_agg(json_build_object(
        'day', tt.day, 'start', tt.start_time, 'end', tt.end_time,
        'subject', tt.subject, 'room', tt.room
      ) order by tt.start_time)
      from public.timetable tt where tt.class = v_student.class
    ), '[]'::json)
  ) into v_result;

  return v_result;
end; $$;

revoke all on function public.get_student_snapshot(text) from public;
grant execute on function public.get_student_snapshot(text) to anon, authenticated;

-- A student updating their own contact info (scoped strictly to their code).
-- Blank values are ignored so partial edits don't wipe fields.
create or replace function public.update_student_self(p_code text, p_name text, p_parent text, p_address text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if length(coalesce(p_code, '')) < 4 then
    raise exception 'Invalid code';
  end if;
  update public.students set
    name = coalesce(nullif(trim(p_name), ''), name),
    parent_contact = coalesce(nullif(trim(p_parent), ''), parent_contact),
    address = coalesce(nullif(trim(p_address), ''), address)
  where student_code = p_code;
end; $$;

revoke all on function public.update_student_self(text, text, text, text) from public;
grant execute on function public.update_student_self(text, text, text, text) to anon, authenticated;

-- ---- Weekly branch report (head only) -------------------------------------
-- Per-branch summary for the last 7 days: roll/new students, staff, attendance
-- rate, fees collected this week, and outstanding fees. Centre-wide totals too.
create or replace function public.weekly_branch_report()
returns json language plpgsql security definer set search_path = public as $$
declare
  v_result json;
  v_since timestamptz := now() - interval '7 days';
  v_date_since date := current_date - 7;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and staff_status = 'approved') then
    raise exception 'Not authorized';
  end if;

  select json_build_object(
    'generated_at', now(),
    'branches', coalesce((
      select json_agg(json_build_object(
        'name', b.name,
        'students', (select count(*) from public.students s where s.branch_id = b.id),
        'new_students', (select count(*) from public.students s where s.branch_id = b.id and s.created_at >= v_since),
        'staff', (select count(*) from public.teachers t where t.branch_id = b.id),
        'att_pct', (
          select coalesce(round(count(*) filter (where a.status = 'Present')::numeric / nullif(count(*), 0) * 100), 0)::int
          from public.attendance a join public.students s on s.id = a.student_id
          where s.branch_id = b.id and a.date >= v_date_since
        ),
        'fees_collected', (
          select coalesce(sum(f.amount), 0)::bigint
          from public.fees f join public.students s on s.id = f.student_id
          where s.branch_id = b.id and f.status = 'Paid' and f.paid_date >= v_date_since
        ),
        'fees_pending', (
          select coalesce(sum(f.amount), 0)::bigint
          from public.fees f join public.students s on s.id = f.student_id
          where s.branch_id = b.id and f.status <> 'Paid'
        )
      ) order by b.is_main desc, b.name)
      from public.branches b
    ), '[]'::json),
    'unassigned_students', (select count(*) from public.students where branch_id is null),
    'tests_this_week', (select count(*) from public.tests where date >= v_date_since)
  ) into v_result;

  return v_result;
end; $$;

revoke all on function public.weekly_branch_report() from public, anon;
grant execute on function public.weekly_branch_report() to authenticated;

-- ---- Realtime: let a pending teacher auto-advance when approved ------------
-- Adds profiles to the realtime publication (idempotent). RLS still applies,
-- so a teacher only receives changes to their own row.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end $$;
