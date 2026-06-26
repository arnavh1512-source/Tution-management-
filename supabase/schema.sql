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
  role text not null check (role in ('admin', 'teacher', 'student')),
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

insert into public.subjects (name) values
  ('Mathematics'), ('Physics'), ('Chemistry'), ('English'), ('Biology');

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
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

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
$$ language plpgsql;

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
-- SEED DATA (matches the demo mock data)
-- ============================================
insert into public.branches (id, name, address, is_main) values
  ('b0000000-0000-0000-0000-000000000001', 'Noida Central Branch', 'Sector 12, Noida, UP', true),
  ('b0000000-0000-0000-0000-000000000002', 'Sector 18 Branch', 'Atta Market, Noida, UP', false),
  ('b0000000-0000-0000-0000-000000000003', 'Indirapuram Branch', 'Shakti Khand, Ghaziabad', false);
