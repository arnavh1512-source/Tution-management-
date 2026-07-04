-- ============================================================================
-- RATE LIMITING — student-code brute-force defense
-- Codes are already strong (30^8 ≈ 6.5e11), so network brute-force is already
-- impractical; this is defense-in-depth. Design principle: only INVALID-code
-- lookups are throttled — a valid code always resolves, so real students are
-- never blocked, even while an attack is in progress.
-- ============================================================================

-- Attempt log, written only by the SECURITY DEFINER snapshot function.
-- No RLS policies => anon/authenticated cannot read or write it directly.
create table if not exists public.code_attempts (
  id bigserial primary key,
  at timestamptz not null default now()
);
alter table public.code_attempts enable row level security;
create index if not exists code_attempts_at_idx on public.code_attempts (at);

-- get_student_snapshot with a sliding-window throttle on failed lookups.
create or replace function public.get_student_snapshot(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare v_student public.students; v_result json; v_c uuid; v_fails int;
begin
  if length(coalesce(p_code,'')) < 4 then return null; end if;

  select * into v_student from public.students where student_code = p_code;

  -- Invalid code: throttle. >25 failed lookups in the last minute (far above any
  -- legitimate pattern) means someone is guessing — reject briefly. Valid codes
  -- skip this entirely, so genuine students are unaffected.
  if v_student.id is null then
    select count(*) into v_fails from public.code_attempts where at > now() - interval '1 minute';
    if v_fails >= 25 then
      raise exception 'Too many attempts — please try again in a minute';
    end if;
    insert into public.code_attempts default values;
    delete from public.code_attempts where at < now() - interval '5 minutes';
    return null;
  end if;

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

grant execute on function public.get_student_snapshot(text) to anon, authenticated;
