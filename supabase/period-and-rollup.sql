-- ============================================================================
-- REPORT PERIODS + ATTENDANCE ROLLUP — Second Skool
-- 1. Report RPCs take p_days (7 = weekly, 30 = monthly).
-- 2. attendance_monthly keeps per-student monthly totals forever;
--    archive_old_attendance() rolls up daily rows older than 90 days and
--    deletes them (day-level detail only; nothing statistical is lost).
-- ============================================================================

-- 1) Replace the no-arg report functions with p_days versions --------------
drop function if exists public.weekly_branch_report();
drop function if exists public.weekly_student_reports();
drop function if exists public.weekly_teacher_activity();

create or replace function public.weekly_branch_report(p_days int default 7)
returns json language plpgsql security definer set search_path = public as $$
declare v_result json; v_since timestamptz := now() - make_interval(days => p_days); v_date_since date := current_date - p_days; v_c uuid := public.current_centre();
begin
  if not public.is_head() then raise exception 'Not authorized'; end if;
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

create or replace function public.weekly_student_reports(p_days int default 7)
returns json language plpgsql security definer set search_path = public as $$
declare v_result json; v_date_since date := current_date - p_days; v_c uuid := public.current_centre();
begin
  if not public.is_head() then raise exception 'Not authorized'; end if;
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

create or replace function public.weekly_teacher_activity(p_days int default 7)
returns json language plpgsql security definer set search_path = public as $$
declare v_result json; v_since timestamptz := now() - make_interval(days => p_days); v_c uuid := public.current_centre();
begin
  if not public.is_head() then raise exception 'Not authorized'; end if;
  select coalesce(json_agg(json_build_object(
    'name', p.full_name, 'email', p.email, 'is_head', (p.role='admin'),
    'attendance_marks', (select count(*) from public.attendance a where a.recorded_by=p.id and a.created_at>=v_since),
    'tests_entered', (select count(*) from public.tests t where t.recorded_by=p.id and t.created_at>=v_since),
    'assignments_created', (select count(*) from public.assignments ag where ag.recorded_by=p.id and ag.created_at>=v_since)
  ) order by (p.role='admin') desc, p.full_name), '[]'::json) into v_result
  from public.profiles p where p.staff_status='approved' and p.role in ('admin','teacher') and p.centre_id=v_c;
  return v_result;
end; $$;

revoke all on function public.weekly_branch_report(int) from public, anon;
revoke all on function public.weekly_student_reports(int) from public, anon;
revoke all on function public.weekly_teacher_activity(int) from public, anon;
grant execute on function public.weekly_branch_report(int) to authenticated;
grant execute on function public.weekly_student_reports(int) to authenticated;
grant execute on function public.weekly_teacher_activity(int) to authenticated;

-- 2) Monthly attendance rollup (kept forever) --------------------------------
create table if not exists public.attendance_monthly (
  id uuid primary key default uuid_generate_v4(),
  centre_id uuid references public.centres(id),
  student_id uuid not null references public.students(id) on delete cascade,
  month date not null,
  present int not null default 0,
  total int not null default 0,
  created_at timestamptz default now(),
  unique(student_id, month)
);
alter table public.attendance_monthly enable row level security;
drop policy if exists att_monthly_read on public.attendance_monthly;
create policy att_monthly_read on public.attendance_monthly for select to authenticated
  using (public.is_staff() and centre_id = public.current_centre());

-- 3) Roll up + trim daily attendance older than 90 days ----------------------
-- Maintenance job: aggregates old daily rows into attendance_monthly, then
-- deletes them. Not callable by app users; run manually or via pg_cron.
create or replace function public.archive_old_attendance()
returns text language plpgsql security definer set search_path = public as $$
declare v_rows int;
begin
  insert into public.attendance_monthly (centre_id, student_id, month, present, total)
  select a.centre_id, a.student_id, date_trunc('month', a.date)::date,
         count(*) filter (where a.status = 'Present'), count(*)
  from public.attendance a
  where a.date < current_date - 90
  group by a.centre_id, a.student_id, date_trunc('month', a.date)
  on conflict (student_id, month) do update
    set present = public.attendance_monthly.present + excluded.present,
        total   = public.attendance_monthly.total   + excluded.total;

  delete from public.attendance where date < current_date - 90;
  get diagnostics v_rows = row_count;
  return 'archived ' || v_rows || ' daily attendance rows';
end; $$;

revoke all on function public.archive_old_attendance() from public, anon, authenticated;

-- 4) OPTIONAL: run automatically on the 2nd of every month at 03:05 ----------
-- Requires the pg_cron extension (Database → Extensions → enable pg_cron),
-- then run:
--   select cron.schedule('archive-attendance', '5 3 2 * *',
--                        'select public.archive_old_attendance()');
