begin;

-- The web client marks notifications read; delivery fields are set by the server.
revoke update on public.tortoise_notifications from public, anon, authenticated;
do $$
declare
  notification_columns text;
begin
  select string_agg(format('%I', attname), ', ' order by attnum)
    into notification_columns
    from pg_attribute
   where attrelid = 'public.tortoise_notifications'::regclass
     and attnum > 0 and not attisdropped;
  execute format(
    'revoke update (%s) on public.tortoise_notifications from public, anon, authenticated',
    notification_columns
  );
end;
$$;
grant update (read_at) on public.tortoise_notifications to authenticated;

commit;
