create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.children (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 50),
  birth_date date,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.child_members (
  child_id uuid not null references public.children(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'caregiver' check (role in ('owner', 'caregiver')),
  created_at timestamptz not null default now(),
  primary key (child_id, user_id)
);

create table public.daily_records (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  record_date date not null,
  medicine_taken boolean,
  medicine_time time,
  dose text not null default '',
  focus text,
  impulse text,
  calm text,
  effect_minutes text,
  duration_hours text,
  sleep_quality text,
  bedtime time,
  wake_time time,
  side_effects text[] not null default '{}'::text[],
  meals jsonb not null default '{"早餐": null, "午餐": null, "晚餐": null, "小食": null}'::jsonb
    check (jsonb_typeof(meals) = 'object'),
  water integer not null default 0 check (water between 0 and 100),
  moods text[] not null default '{}'::text[],
  meltdowns integer not null default 0 check (meltdowns between 0 and 100),
  eye_contact text,
  social_distance text,
  body_contact text,
  sensory text[] not null default '{}'::text[],
  notes text not null default '',
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, record_date)
);

create table public.checkup_notes (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  is_done boolean not null default false,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.child_invites (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  token_hash bytea not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index child_members_user_id_idx on public.child_members(user_id);
create index daily_records_child_date_idx
  on public.daily_records(child_id, record_date desc);
create index checkup_notes_child_created_idx
  on public.checkup_notes(child_id, created_at desc);
create index child_invites_child_id_idx on public.child_invites(child_id);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger children_set_updated_at
before update on public.children
for each row execute function private.set_updated_at();

create trigger daily_records_set_updated_at
before update on public.daily_records
for each row execute function private.set_updated_at();

create trigger checkup_notes_set_updated_at
before update on public.checkup_notes
for each row execute function private.set_updated_at();

create function private.add_child_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.child_members (child_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger children_add_owner
after insert on public.children
for each row execute function private.add_child_owner();

create function private.is_child_member(p_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.child_members
    where child_id = p_child_id
      and user_id = (select auth.uid())
  );
$$;

create function private.is_child_owner(p_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.child_members
    where child_id = p_child_id
      and user_id = (select auth.uid())
      and role = 'owner'
  );
$$;

alter table public.children enable row level security;
alter table public.child_members enable row level security;
alter table public.daily_records enable row level security;
alter table public.checkup_notes enable row level security;
alter table public.child_invites enable row level security;

create policy "children_select_for_members"
on public.children for select
to authenticated
using (private.is_child_member(id));

create policy "children_insert_for_creator"
on public.children for insert
to authenticated
with check (created_by = (select auth.uid()));

create policy "children_update_for_members"
on public.children for update
to authenticated
using (private.is_child_member(id))
with check (private.is_child_member(id));

create policy "children_delete_for_owner"
on public.children for delete
to authenticated
using (private.is_child_owner(id));

create policy "members_select_own_memberships"
on public.child_members for select
to authenticated
using (user_id = (select auth.uid()));

create policy "daily_records_select_for_members"
on public.daily_records for select
to authenticated
using (private.is_child_member(child_id));

create policy "daily_records_insert_for_members"
on public.daily_records for insert
to authenticated
with check (
  private.is_child_member(child_id)
  and updated_by = (select auth.uid())
);

create policy "daily_records_update_for_members"
on public.daily_records for update
to authenticated
using (private.is_child_member(child_id))
with check (
  private.is_child_member(child_id)
  and updated_by = (select auth.uid())
);

create policy "daily_records_delete_for_members"
on public.daily_records for delete
to authenticated
using (private.is_child_member(child_id));

create policy "checkup_notes_select_for_members"
on public.checkup_notes for select
to authenticated
using (private.is_child_member(child_id));

create policy "checkup_notes_insert_for_members"
on public.checkup_notes for insert
to authenticated
with check (
  private.is_child_member(child_id)
  and created_by = (select auth.uid())
);

create policy "checkup_notes_update_for_members"
on public.checkup_notes for update
to authenticated
using (private.is_child_member(child_id))
with check (private.is_child_member(child_id));

create policy "checkup_notes_delete_for_members"
on public.checkup_notes for delete
to authenticated
using (private.is_child_member(child_id));

create function private.create_child_invite(p_child_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite_token text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not private.is_child_owner(p_child_id) then
    raise exception 'Only the child owner can create an invitation'
      using errcode = '42501';
  end if;

  delete from public.child_invites
  where child_id = p_child_id
    and accepted_at is null;

  invite_token := encode(extensions.gen_random_bytes(24), 'hex');

  insert into public.child_invites (
    child_id,
    token_hash,
    created_by,
    expires_at
  )
  values (
    p_child_id,
    extensions.digest(invite_token, 'sha256'),
    (select auth.uid()),
    now() + interval '24 hours'
  );

  return invite_token;
end;
$$;

create function private.accept_child_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite_record public.child_invites%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into invite_record
  from public.child_invites
  where token_hash = extensions.digest(p_token, 'sha256')
    and accepted_at is null
    and expires_at > now()
  for update;

  if invite_record.id is null then
    raise exception 'Invitation is invalid or expired' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.child_members
    where child_id = invite_record.child_id
      and user_id = (select auth.uid())
  ) then
    return invite_record.child_id;
  end if;

  insert into public.child_members (child_id, user_id, role)
  values (invite_record.child_id, (select auth.uid()), 'caregiver');

  update public.child_invites
  set accepted_by = (select auth.uid()),
      accepted_at = now()
  where id = invite_record.id;

  return invite_record.child_id;
end;
$$;

create function public.create_child_invite(p_child_id uuid)
returns text
language sql
security invoker
set search_path = ''
as $$
  select private.create_child_invite(p_child_id);
$$;

create function public.accept_child_invite(p_token text)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.accept_child_invite(p_token);
$$;

revoke all on all tables in schema public from anon;
revoke all on public.child_invites from authenticated;

grant select, insert, update, delete
  on public.children, public.daily_records, public.checkup_notes
  to authenticated;
grant select on public.child_members to authenticated;

revoke all on function private.set_updated_at() from public;
revoke all on function private.add_child_owner() from public;
revoke all on function private.is_child_member(uuid) from public;
revoke all on function private.is_child_owner(uuid) from public;
revoke all on function private.create_child_invite(uuid) from public;
revoke all on function private.accept_child_invite(text) from public;
revoke all on function public.create_child_invite(uuid) from public;
revoke all on function public.accept_child_invite(text) from public;

grant execute on function private.is_child_member(uuid) to authenticated;
grant execute on function private.is_child_owner(uuid) to authenticated;
grant execute on function private.create_child_invite(uuid) to authenticated;
grant execute on function private.accept_child_invite(text) to authenticated;
grant execute on function public.create_child_invite(uuid) to authenticated;
grant execute on function public.accept_child_invite(text) to authenticated;

comment on table public.children is 'Child profiles managed by one or more authenticated caregivers.';
comment on table public.daily_records is 'One wellbeing record per child and local calendar date.';
comment on table public.checkup_notes is 'Questions and notes to raise at a future medical checkup.';
comment on table public.child_invites is 'Hashed, one-time, 24-hour invitations for child co-management.';
