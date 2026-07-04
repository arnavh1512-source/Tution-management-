-- ============================================================================
-- NOTES / STUDY MATERIAL — Second Skool
-- Teachers share notes to a class. Cost-controlled: typed text is free (DB
-- rows); an optional PDF/image lives in Storage (public bucket, capped client
-- side); an optional YouTube/Drive link costs nothing (streams from Google).
-- Student notes are lazy-loaded via get_student_notes (not in the snapshot),
-- so files/metadata are only fetched when a student opens the screen.
-- ============================================================================

create table if not exists public.notes (
  id uuid primary key default uuid_generate_v4(),
  centre_id uuid references public.centres(id) default public.current_centre(),
  class text not null,
  title text not null,
  subject text,
  body text,        -- typed note (free, no storage)
  file_url text,    -- optional PDF/image (Storage public URL)
  link_url text,    -- optional YouTube / Drive link
  created_by uuid references public.profiles(id) default auth.uid(),
  created_at timestamptz default now()
);
alter table public.notes enable row level security;

drop policy if exists notes_staff on public.notes;
create policy notes_staff on public.notes for all to authenticated
  using (public.is_staff() and centre_id = public.current_centre())
  with check (public.is_staff() and centre_id = public.current_centre());

-- Storage bucket for note files. Public bucket: the object endpoint serves
-- downloads WITHOUT any RLS, so students (anon) can open a file via its exact
-- URL. We deliberately DO NOT add a public SELECT policy on storage.objects —
-- that would allow listing/enumerating every centre's files. Paths are random
-- UUIDs, so a file is only reachable by someone given its exact link (which
-- only get_student_notes hands out, scoped to the student's own class).
insert into storage.buckets (id, name, public) values ('notes', 'notes', true)
  on conflict (id) do nothing;

drop policy if exists "notes files public read" on storage.objects;  -- remove listing
drop policy if exists "notes files staff upload" on storage.objects;
drop policy if exists "notes files staff delete" on storage.objects;
create policy "notes files staff upload" on storage.objects for insert to authenticated with check (bucket_id = 'notes' and public.is_staff());
create policy "notes files staff delete" on storage.objects for delete to authenticated using (bucket_id = 'notes' and public.is_staff());

-- Lazy-loaded notes for a student (by code), scoped to their class + centre.
create or replace function public.get_student_notes(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare v_student public.students;
begin
  if length(coalesce(p_code,'')) < 4 then return '[]'::json; end if;
  select * into v_student from public.students where student_code = p_code;
  if v_student.id is null then return '[]'::json; end if;
  return coalesce((
    select json_agg(json_build_object(
      'title', n.title, 'subject', n.subject, 'body', n.body,
      'fileUrl', n.file_url, 'linkUrl', n.link_url, 'date', n.created_at
    ) order by n.created_at desc)
    from public.notes n
    where n.class = v_student.class and n.centre_id = v_student.centre_id
  ), '[]'::json);
end; $$;

revoke all on function public.get_student_notes(text) from public;
grant execute on function public.get_student_notes(text) to anon, authenticated;
