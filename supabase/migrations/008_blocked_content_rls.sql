begin;

-- Preserve anonymous public access while making block relationships effective
-- for authenticated direct PostgREST requests.
create or replace function public.lt_is_blocked_author(target_author uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $blocked$
  select auth.uid() is not null
    and target_author is not null
    and exists (
      select from public.lt_blocks b
      where b.owner_id = (select auth.uid())
        and b.member_id = target_author
    );
$blocked$;
revoke all on function public.lt_is_blocked_author(uuid) from public, anon, authenticated;
grant execute on function public.lt_is_blocked_author(uuid) to authenticated;

drop policy if exists posts_public_read on public.tortoise_posts;
create policy posts_public_read on public.tortoise_posts
for select to anon using (true);
create policy posts_authenticated_unblocked_read on public.tortoise_posts
for select to authenticated
using (author_id is null or not public.lt_is_blocked_author(author_id));

drop policy if exists comments_public_read on public.tortoise_comments;
create policy comments_public_read on public.tortoise_comments
for select to anon using (true);
create policy comments_authenticated_unblocked_read on public.tortoise_comments
for select to authenticated
using (author_id is null or not public.lt_is_blocked_author(author_id));

drop policy if exists notifications_own_select on public.tortoise_notifications;
create policy notifications_own_select on public.tortoise_notifications
for select to authenticated
using (
  recipient_id = (select auth.uid())
  and exists (
    select from public.tortoise_comments c
    where c.id = tortoise_notifications.comment_id
  )
);

-- This SECURITY DEFINER projection must enforce the same block rule itself.
create or replace function public.get_tortoise_post_authors(p_post_ids uuid[])
returns table(post_id uuid, nickname text)
language sql
stable
security definer
set search_path = ''
as $authors$
  select
    p.id,
    left(
      coalesce(
        nullif(btrim(u.raw_user_meta_data->>'nickname'), ''),
        nullif(btrim(u.raw_user_meta_data->>'display_name'), ''),
        '회원'
      ),
      20
    ) as nickname
  from public.tortoise_posts p
  left join auth.users u on u.id=p.author_id
  where p.id = any(p_post_ids)
    and (p.author_id is null or not public.lt_is_blocked_author(p.author_id))
  limit 100;
$authors$;

commit;
