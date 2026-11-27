begin;

create index lt_reports_reporter_time_idx on public.lt_reports(reporter, created_at desc);

create function public.lt_limit_report_frequency() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is distinct from new.reporter then
    raise exception 'reporter mismatch' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('lt_reports:' || new.reporter::text, 0));
  if exists (
    select 1 from public.lt_reports
    where reporter = new.reporter and created_at > clock_timestamp() - interval '1 hour'
    offset 9 limit 1
  ) then
    raise exception 'report limit reached' using errcode = 'PT429';
  end if;
  return new;
end;
$$;

revoke all on function public.lt_limit_report_frequency() from public, anon, authenticated;
create trigger lt_report_frequency before insert on public.lt_reports
for each row execute function public.lt_limit_report_frequency();

commit;
