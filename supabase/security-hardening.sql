-- ============================================================================
-- SECURITY HARDENING — Second Skool
-- Fixes from the security audit. Safe to run once; idempotent.
-- ============================================================================

-- C1) CRITICAL — block self-privilege-escalation via profiles.
-- The profiles_update_self RLS policy lets a user update their OWN row, but
-- RLS cannot restrict columns — so any signed-in user could set
-- role='admin', staff_status='approved', or hop centre_id via the REST API.
-- Column-level privileges close this: authenticated may update ONLY the
-- harmless profile fields. Role/status/centre changes happen exclusively
-- through SECURITY DEFINER RPCs (create_centre, join_centre, approve_teacher,
-- grant_head, ...), which run as the table owner and are unaffected.
revoke update on public.profiles from authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

-- The signup trigger (SECURITY DEFINER) creates profile rows; clients never
-- insert directly, so remove the insert path too.
revoke insert on public.profiles from authenticated;

-- C1b) Same class of hole on centres: owner may rename, but only the name.
revoke update on public.centres from authenticated;
grant update (name) on public.centres to authenticated;

-- H1) subscriptions policy was head-only but NOT centre-scoped; the table is
-- unused by the app — deny everything until billing is actually built.
drop policy if exists subs_head on public.subscriptions;
revoke all on public.subscriptions from authenticated, anon;

-- M1) Stronger join codes for NEW centres: 10 chars from a v4 UUID
-- (~1e12 combinations) instead of 6 hex chars from md5(random()) (~16.7M).
-- Existing centres keep their current code.
create or replace function public.create_centre(p_name text)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_code text;
begin
  if length(coalesce(trim(p_name), '')) < 2 or length(trim(p_name)) > 80 then
    raise exception 'Enter a centre name (2-80 characters)';
  end if;
  if (select centre_id from public.profiles where id = auth.uid()) is not null then
    raise exception 'You already belong to a centre';
  end if;
  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    exit when not exists (select 1 from public.centres where join_code = v_code);
  end loop;
  insert into public.centres (name, join_code, owner_id) values (trim(p_name), v_code, auth.uid()) returning id into v_id;
  update public.profiles set role='admin', staff_status='approved', centre_id=v_id, head_requested=false where id = auth.uid();
  return json_build_object('centre_id', v_id, 'join_code', v_code, 'name', trim(p_name));
end; $$;

-- L3) Cap anonymous student-edit inputs so a leaked code can't be used to
-- stuff oversized data; blank values still ignored.
create or replace function public.update_student_self(p_code text, p_name text, p_parent text, p_address text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if length(coalesce(p_code, '')) < 4 or length(p_code) > 40 then
    raise exception 'Invalid code';
  end if;
  update public.students set
    name = coalesce(nullif(left(trim(p_name), 100), ''), name),
    parent_contact = coalesce(nullif(left(trim(p_parent), 30), ''), parent_contact),
    address = coalesce(nullif(left(trim(p_address), 300), ''), address)
  where student_code = p_code;
end; $$;

-- L3b) Cap the signup-derived display name too.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, staff_status)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 120),
    new.email,
    'student',
    'none'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
