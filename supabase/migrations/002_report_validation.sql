begin;

-- Validate against the same rows the reporting member can see.
create function public.lt_validate_report_target() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if new.kind = 'post' then
    perform 1 from public.tortoise_posts where id = new.target;
  elsif new.kind = 'comment' then
    perform 1 from public.tortoise_comments where id = new.target;
  elsif new.kind = 'member' then
    if new.target = auth.uid() then
      raise exception 'invalid report target' using errcode = '23514';
    end if;
    perform 1 where exists (select 1 from public.tortoise_posts where author_id = new.target)
                 or exists (select 1 from public.tortoise_comments where author_id = new.target);
  end if;
  if not found then
    raise exception 'invalid report target' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.lt_validate_report_target() from public, anon, authenticated;
create trigger lt_validate_report_target before insert on public.lt_reports
for each row execute function public.lt_validate_report_target();
commit;