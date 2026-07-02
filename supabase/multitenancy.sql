-- ============================================================================
-- MULTI-TENANCY MIGRATION — Second Skool
-- Converts the single-centre app into a multi-tenant SaaS. Every centre's data
-- is isolated by centre_id; RLS + SECURITY DEFINER RPCs scope to the caller's
-- centre. Safe to run once on the existing database (idempotent where possible).
-- ⚠️ Back up first (Supabase → Database → Backups) before running in production.
-- ============================================================================

-- 1) CENTRES (tenants) --------------------------------------------------------
create table if not exists public.centres (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  join_code text unique not null,
  owner_id uuid references public.profiles(id),
  created_at timestamptz default now()
);
alter table public.centres enable row level security;

-- 2) current_centre() — the caller's centre (used by defaults + RLS) ----------
create or replace function public.current_centre()
returns uuid language sql security definer stable set search_path = public as $$
  select centre_id from public.profiles where id = auth.uid()
$$;
revoke all on function public.current_centre() from public;
grant execute on function public.current_centre() to anon, authenticated;

-- 3) centre_id on every tenant table -----------------------------------------
alter table public.profiles      add column if not exists centre_id uuid references public.centres(id);
-- Child/data tables default to the acting user's centre so existing inserts
-- (which never mention centre_id) are stamped automatically.
alter table public.teachers      add column if not exists centre_id uuid references public.centres(id) default public.current_centre();
alter table public.students       add column if not exists centre_id uuid references public.centres(id) default public.current_centre();
alter table public.branches       add column if not exists centre_id uuid references public.centres(id) default public.current_centre();
alter table public.subjects       add column if not exists centre_id uuid references public.centres(id) default public.current_centre();
alter table public.tests          add column if not exists centre_id uuid references public.centres(id) default public.current_centre();
alter table public.results        add column if not exists centre_id uuid references public.centres(id) default public.current_centre();
alter table public.attendance     add column if not exists centre_id uuid references public.centres(id) default public.current_centre();
alter table public.assignments    add column if not exists centre_id uuid references public.centres(id) default public.current_centre();
alter table public.fees           add column if not exists centre_id uuid references public.centres(id) default public.current_centre();
alter table public.meetings       add column if not exists centre_id uuid references public.centres(id) default public.current_centre();
alter table public.reminders      add column if not exists centre_id uuid references public.centres(id) default public.current_centre();
alter table public.notifications  add column if not exists centre_id uuid references public.centres(id) default public.current_centre();
alter table public.timetable      add column if not exists centre_id uuid references public.centres(id) default public.current_centre();

-- 4) BACKFILL — move all existing data into one centre owned by the first head
do $$
declare v_admin uuid; v_centre uuid; v_code text;
begin
  if not exists (select 1 from public.centres) then
    select id into v_admin from public.profiles where role='admin' and staff_status='approved' order by created_at limit 1;
    if v_admin is null then select id into v_admin from public.profiles order by created_at limit 1; end if;
    v_code := upper(substr(md5(random()::text), 1, 6));
    insert into public.centres (name, join_code, owner_id) values ('My Centre', v_code, v_admin) returning id into v_centre;
    update public.profiles      set centre_id = v_centre where centre_id is null;
    update public.teachers      set centre_id = v_centre where centre_id is null;
    update public.students      set centre_id = v_centre where centre_id is null;
    update public.branches      set centre_id = v_centre where centre_id is null;
    update public.subjects      set centre_id = v_centre where centre_id is null;
    update public.tests         set centre_id = v_centre where centre_id is null;
    update public.results       set centre_id = v_centre where centre_id is null;
    update public.attendance    set centre_id = v_centre where centre_id is null;
    update public.assignments   set centre_id = v_centre where centre_id is null;
    update public.fees          set centre_id = v_centre where centre_id is null;
    update public.meetings      set centre_id = v_centre where centre_id is null;
    update public.reminders     set centre_id = v_centre where centre_id is null;
    update public.notifications set centre_id = v_centre where centre_id is null;
    update public.timetable     set centre_id = v_centre where centre_id is null;
  end if;
end $$;

-- 5) Registration RPCs --------------------------------------------------------
-- Create a brand-new centre and become its head.
create or replace function public.create_centre(p_name text)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_code text;
begin
  if length(coalesce(trim(p_name), '')) < 2 then raise exception 'Enter a centre name'; end if;
  if (select centre_id from public.profiles where id = auth.uid()) is not null then
    raise exception 'You already belong to a centre';
  end if;
  loop
    v_code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from public.centres where join_code = v_code);
  end loop;
  insert into public.centres (name, join_code, owner_id) values (trim(p_name), v_code, auth.uid()) returning id into v_id;
  update public.profiles set role='admin', staff_status='approved', centre_id=v_id, head_requested=false where id = auth.uid();
  return json_build_object('centre_id', v_id, 'join_code', v_code, 'name', trim(p_name));
end; $$;

-- Join an existing centre with its code (as a pending teacher).
create or replace function public.join_centre(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_name text;
begin
  select id, name into v_id, v_name from public.centres where join_code = upper(trim(coalesce(p_code, '')));
  if v_id is null then raise exception 'Invalid centre code'; end if;
  if (select centre_id from public.profiles where id = auth.uid()) is not null then
    raise exception 'You already belong to a centre';
  end if;
  update public.profiles set role='teacher', staff_status='pending', centre_id=v_id where id = auth.uid();
  return json_build_object('centre_id', v_id, 'name', v_name);
end; $$;

-- The head's own centre (name + join code to share with teachers).
create or replace function public.my_centre()
returns json language plpgsql security definer set search_path = public as $$
declare v json;
begin
  select json_build_object('name', c.name, 'join_code', c.join_code)
  into v from public.centres c where c.id = public.current_centre();
  return v;
end; $$;

revoke all on function public.create_centre(text) from public, anon;
revoke all on function public.join_centre(text) from public, anon;
revoke all on function public.my_centre() from public, anon;
grant execute on function public.create_centre(text) to authenticated;
grant execute on function public.join_centre(text) to authenticated;
grant execute on function public.my_centre() to authenticated;

-- 6) is_head()/is_staff() stay user-checks; RLS adds the centre_id row match.
create or replace function public.is_head()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role='admin' and staff_status='approved')
$$;
create or replace function public.is_staff()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','teacher') and staff_status='approved')
$$;
revoke all on function public.is_head() from public, anon;
revoke all on function public.is_staff() from public, anon;
grant execute on function public.is_head() to authenticated;
grant execute on function public.is_staff() to authenticated;

-- 7) Drop ALL existing policies on tenant tables, then recreate centre-scoped.
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname='public'
    and tablename in ('profiles','centres','branches','teachers','students','attendance','subjects','tests','results','assignments','assignment_submissions','fees','meetings','reminders','notifications','timetable','subscriptions')
  loop execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename); end loop;
end $$;

-- centres: a member reads their own centre; the owner can rename it.
create policy centres_read on public.centres for select to authenticated using (id = public.current_centre());
create policy centres_write on public.centres for update to authenticated using (owner_id = auth.uid());

-- profiles: read own row always; the head reads everyone in their centre.
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or (public.is_head() and centre_id = public.current_centre()));
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid());
create policy profiles_insert_self on public.profiles for insert to authenticated with check (id = auth.uid());
-- the head can update staff rows in their centre (approvals, grant/remove).
create policy profiles_update_head on public.profiles for update to authenticated
  using (public.is_head() and centre_id = public.current_centre());

-- Helper to build symmetric staff/head policies scoped to the centre.
-- (Written out per table for clarity.)

-- Staff-writable, centre-scoped: students, attendance, tests, results,
-- assignments, reminders, notifications, timetable.
create policy students_staff    on public.students    for all to authenticated using (public.is_staff() and centre_id = public.current_centre()) with check (public.is_staff() and centre_id = public.current_centre());
create policy attendance_staff  on public.attendance  for all to authenticated using (public.is_staff() and centre_id = public.current_centre()) with check (public.is_staff() and centre_id = public.current_centre());
create policy tests_staff       on public.tests       for all to authenticated using (public.is_staff() and centre_id = public.current_centre()) with check (public.is_staff() and centre_id = public.current_centre());
create policy results_staff     on public.results     for all to authenticated using (public.is_staff() and centre_id = public.current_centre()) with check (public.is_staff() and centre_id = public.current_centre());
create policy assignments_staff on public.assignments for all to authenticated using (public.is_staff() and centre_id = public.current_centre()) with check (public.is_staff() and centre_id = public.current_centre());
create policy reminders_staff   on public.reminders   for all to authenticated using (public.is_staff() and centre_id = public.current_centre()) with check (public.is_staff() and centre_id = public.current_centre());
create policy notifs_staff      on public.notifications for all to authenticated using (public.is_staff() and centre_id = public.current_centre()) with check (public.is_staff() and centre_id = public.current_centre());
create policy timetable_staff   on public.timetable   for all to authenticated using (public.is_staff() and centre_id = public.current_centre()) with check (public.is_staff() and centre_id = public.current_centre());

-- Head-only, centre-scoped: teachers, branches, subjects, fees, meetings.
create policy teachers_head  on public.teachers  for all to authenticated using (public.is_head() and centre_id = public.current_centre()) with check (public.is_head() and centre_id = public.current_centre());
create policy branches_head  on public.branches  for all to authenticated using (public.is_head() and centre_id = public.current_centre()) with check (public.is_head() and centre_id = public.current_centre());
create policy subjects_head  on public.subjects  for all to authenticated using (public.is_head() and centre_id = public.current_centre()) with check (public.is_head() and centre_id = public.current_centre());
create policy fees_head      on public.fees      for all to authenticated using (public.is_head() and centre_id = public.current_centre()) with check (public.is_head() and centre_id = public.current_centre());
create policy meetings_head  on public.meetings  for all to authenticated using (public.is_head() and centre_id = public.current_centre()) with check (public.is_head() and centre_id = public.current_centre());

-- Teachers also need to READ head-managed reference tables (their centre only).
create policy teachers_read  on public.teachers  for select to authenticated using (public.is_staff() and centre_id = public.current_centre());
create policy branches_read  on public.branches  for select to authenticated using (public.is_staff() and centre_id = public.current_centre());
create policy subjects_read  on public.subjects  for select to authenticated using (public.is_staff() and centre_id = public.current_centre());
create policy fees_read      on public.fees      for select to authenticated using (public.is_staff() and centre_id = public.current_centre());
create policy meetings_read  on public.meetings  for select to authenticated using (public.is_staff() and centre_id = public.current_centre());

-- subscriptions (if used): head only.
create policy subs_head on public.subscriptions for all to authenticated using (public.is_head()) with check (public.is_head());

-- 8) Re-scope SECURITY DEFINER report RPCs to the caller's centre -------------
create or replace function public.weekly_branch_report()
returns json language plpgsql security definer set search_path = public as $$
declare v_result json; v_since timestamptz := now() - interval '7 days'; v_date_since date := current_date - 7; v_c uuid := public.current_centre();
begin
  if not exists (select 1 from public.profiles where id=auth.uid() and role='admin' and staff_status='approved') then raise exception 'Not authorized'; end if;
  select json_build_object(
    'generated_at', now(),
    'branches', coalesce((select json_agg(json_build_object(
      'name', b.name,
      'students', (select count(*) from public.students s where s.branch_id=b.id),
      'new_students', (select count(*) from public.students s where s.branch_id=b.id and s.created_at>=v_since),
      'staff', (select count(*) from public.teachers t where t.branch_id=b.id),
      'att_pct', (select coalesce(round(count(*) filter (where a.status='Present')::numeric/nullif(count(*),0)*100),0)::int from public.attendance a join public.students s on s.id=a.student_id where s.branch_id=b.id and a.date>=v_date_since),
      'fees_collected', (select coalesce(sum(f.amount),0)::bigint from public.fees f join public.students s on s.id=f.student_id where s.branch_id=b.id and f.status='Paid' and f.paid_date>=v_date_since),
      'fees_pending', (select coalesce(sum(f.amount),0)::bigint from public.fees f join public.students s on s.id=f.student_id where s.branch_id=b.id and f.status<>'Paid')
    ) order by b.is_main desc, b.name) from public.branches b where b.centre_id=v_c),'[]'::json),
    'unassigned_students', (select count(*) from public.students where branch_id is null and centre_id=v_c),
    'tests_this_week', (select count(*) from public.tests where date>=v_date_since and centre_id=v_c)
  ) into v_result; return v_result;
end; $$;

create or replace function public.weekly_student_reports()
returns json language plpgsql security definer set search_path = public as $$
declare v_result json; v_date_since date := current_date - 7; v_c uuid := public.current_centre();
begin
  if not exists (select 1 from public.profiles where id=auth.uid() and role='admin' and staff_status='approved') then raise exception 'Not authorized'; end if;
  select coalesce(json_agg(json_build_object(
    'name', s.name, 'klass', s.class, 'parent', s.parent_contact, 'fee_status', s.fee_status,
    'att_present', (select count(*) from public.attendance a where a.student_id=s.id and a.date>=v_date_since and a.status='Present'),
    'att_total', (select count(*) from public.attendance a where a.student_id=s.id and a.date>=v_date_since),
    'tests', (select count(*) from public.results r join public.tests t on t.id=r.test_id where r.student_id=s.id and t.date>=v_date_since),
    'avg_pct', (select coalesce(round(sum(r.marks)::numeric/nullif(sum(t.max_marks),0)*100),0)::int from public.results r join public.tests t on t.id=r.test_id where r.student_id=s.id and t.date>=v_date_since)
  ) order by s.name), '[]'::json) into v_result
  from public.students s where s.centre_id=v_c;
  return v_result;
end; $$;

create or replace function public.weekly_teacher_activity()
returns json language plpgsql security definer set search_path = public as $$
declare v_result json; v_since timestamptz := now() - interval '7 days'; v_c uuid := public.current_centre();
begin
  if not exists (select 1 from public.profiles where id=auth.uid() and role='admin' and staff_status='approved') then raise exception 'Not authorized'; end if;
  select coalesce(json_agg(json_build_object(
    'name', p.full_name, 'email', p.email, 'is_head', (p.role='admin'),
    'attendance_marks', (select count(*) from public.attendance a where a.recorded_by=p.id and a.created_at>=v_since),
    'tests_entered', (select count(*) from public.tests t where t.recorded_by=p.id and t.created_at>=v_since),
    'assignments_created', (select count(*) from public.assignments ag where ag.recorded_by=p.id and ag.created_at>=v_since)
  ) order by (p.role='admin') desc, p.full_name), '[]'::json) into v_result
  from public.profiles p where p.staff_status='approved' and p.role in ('admin','teacher') and p.centre_id=v_c;
  return v_result;
end; $$;

-- 9) Student snapshot — scope teachers/rankings/timetable/assignments to the
-- student's OWN centre (class names can collide across centres).
create or replace function public.get_student_snapshot(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare v_student public.students; v_result json; v_c uuid;
begin
  if length(coalesce(p_code,'')) < 4 then return null; end if;
  select * into v_student from public.students where student_code = p_code;
  if v_student.id is null then return null; end if;
  v_c := v_student.centre_id;
  select json_build_object(
    'student', json_build_object('dbId',v_student.id,'name',v_student.name,'klass',v_student.class,'school',v_student.school,'code',v_student.student_code,'parent',v_student.parent_contact,'address',v_student.address,'feeStatus',v_student.fee_status),
    'attendance', coalesce((select json_agg(json_build_object('date',a.date,'status',a.status) order by a.date desc) from public.attendance a where a.student_id=v_student.id),'[]'::json),
    'results', coalesce((select json_agg(json_build_object('subject',s.name,'test',t.name,'date',t.date,'marks',r.marks,'total',t.max_marks) order by t.date desc) from public.results r join public.tests t on t.id=r.test_id join public.subjects s on s.id=t.subject_id where r.student_id=v_student.id),'[]'::json),
    'fees', coalesce((select json_agg(json_build_object('period',f.period,'amount',f.amount,'status',f.status,'dueDate',f.due_date,'paidDate',f.paid_date) order by f.due_date desc) from public.fees f where f.student_id=v_student.id),'[]'::json),
    'notifications', coalesce((select json_agg(json_build_object('title',n.title,'detail',n.detail,'icon',n.icon,'createdAt',n.created_at) order by n.created_at desc) from public.notifications n where n.student_id=v_student.id),'[]'::json),
    'teachers', coalesce((select json_agg(json_build_object('name',te.name,'subject',te.subject,'experience',te.experience,'qualification',te.qualification,'rating',te.rating,'about',te.about) order by te.created_at desc) from public.teachers te where te.centre_id=v_c),'[]'::json),
    'rankings', coalesce((select json_object_agg(subject,arr) from (select subject, json_agg(json_build_array(name,pct) order by pct desc) as arr from (select s.name as subject, st.name as name, round(sum(r.marks)::numeric/nullif(sum(t.max_marks),0)*100)::int as pct from public.results r join public.tests t on t.id=r.test_id join public.subjects s on s.id=t.subject_id join public.students st on st.id=r.student_id where st.centre_id=v_c group by s.name, st.name) per_student group by subject) ranked),'{}'::json),
    'timetable', coalesce((select json_agg(json_build_object('day',tt.day,'start',tt.start_time,'end',tt.end_time,'subject',tt.subject,'room',tt.room) order by tt.start_time) from public.timetable tt where tt.class=v_student.class and tt.centre_id=v_c),'[]'::json),
    'assignments', coalesce((select json_agg(json_build_object('title',ag.title,'subject',sub.name,'due',ag.due_date,'instructions',ag.instructions) order by ag.due_date desc) from public.assignments ag left join public.subjects sub on sub.id=ag.subject_id where ag.class=v_student.class and ag.centre_id=v_c),'[]'::json)
  ) into v_result;
  return v_result;
end; $$;

-- head_exists() is now per-centre (kept for compatibility; the client uses the
-- profile's centre_id to decide the register screen instead).
create or replace function public.head_exists()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where centre_id = public.current_centre() and role='admin' and staff_status='approved')
$$;

grant execute on function public.head_exists() to anon, authenticated;

-- 10) Staff-management RPCs re-scoped: a head can only act on staff in their
-- OWN centre (the `and centre_id = current_centre()` guard on each update).
create or replace function public.approve_teacher(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_head() then raise exception 'Not authorized'; end if;
  update public.profiles set role='teacher', staff_status='approved'
    where id = p_id and centre_id = public.current_centre();
end; $$;

create or replace function public.reject_teacher(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_head() then raise exception 'Not authorized'; end if;
  update public.profiles set staff_status='rejected', head_requested=false
    where id = p_id and centre_id = public.current_centre();
end; $$;

create or replace function public.grant_head(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_head() then raise exception 'Not authorized'; end if;
  update public.profiles set role='admin', staff_status='approved', head_requested=false
    where id = p_id and centre_id = public.current_centre();
end; $$;

create or replace function public.remove_staff(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_head() then raise exception 'Not authorized'; end if;
  if p_id = auth.uid() then raise exception 'You cannot remove yourself'; end if;
  update public.profiles set role='student', staff_status='rejected', head_requested=false
    where id = p_id and centre_id = public.current_centre();
end; $$;
