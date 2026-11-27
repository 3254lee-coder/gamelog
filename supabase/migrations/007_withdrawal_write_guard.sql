begin;

-- Once withdrawal starts, keep an authenticated session from creating or
-- changing application data while Storage/Auth cleanup is retried. Share the
-- same per-member lock used by withdrawal preparation and photo uploads.
create function public.lt_block_withdrawal_writes() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  member uuid;
  requester uuid := auth.uid();
begin
  if auth.role() = 'service_role' then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  if requester is not null then
    perform pg_advisory_xact_lock(hashtextextended(requester::text, 0));
    if exists (
      select from public.lt_withdrawals
      where owner_id = requester and started_at is not null
    ) then
      raise exception 'account withdrawal is in progress';
    end if;
  end if;

  case tg_table_name
    when 'tortoise_posts' then member := coalesce(new.author_id, old.author_id);
    when 'tortoise_comments' then member := coalesce(new.author_id, old.author_id);
    when 'tortoises' then member := coalesce(new.user_id, old.user_id);
    when 'tortoise_growth_records' then member := coalesce(new.user_id, old.user_id);
    when 'tortoise_post_likes' then member := coalesce(new.user_id, old.user_id);
    when 'lt_reports' then member := coalesce(new.reporter, old.reporter);
    when 'lt_blocks' then member := coalesce(new.owner_id, old.owner_id);
    else raise exception 'unsupported withdrawal write guard table';
  end case;

  if member is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(member::text, 0));
  if exists (
    select from public.lt_withdrawals
    where owner_id = member and started_at is not null
  ) then
    raise exception 'account withdrawal is in progress';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function public.lt_block_withdrawal_writes() from public, anon, authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'tortoise_posts',
    'tortoise_comments',
    'tortoises',
    'tortoise_growth_records',
    'tortoise_post_likes',
    'lt_reports',
    'lt_blocks'
  ] loop
    execute format(
      'create trigger lt_block_withdrawal_writes before insert or update or delete on public.%I for each row execute function public.lt_block_withdrawal_writes()',
      table_name
    );
  end loop;
end;
$$;

commit;
