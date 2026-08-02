create policy "child_invites_deny_direct_access"
on public.child_invites
for all
to anon, authenticated
using (false)
with check (false);

create index children_created_by_idx on public.children(created_by);
create index daily_records_updated_by_idx on public.daily_records(updated_by);
create index checkup_notes_created_by_idx on public.checkup_notes(created_by);
create index child_invites_created_by_idx on public.child_invites(created_by);
create index child_invites_accepted_by_idx on public.child_invites(accepted_by);

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute
      'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;
