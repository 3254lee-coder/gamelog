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


-- Apply each member's block list before counting and pagination. Anonymous
-- browsing remains unchanged, while blocked posts do not distort result pages.
create or replace function public.browse_tortoise_posts(
  p_category text default 'all',
  p_query text default '',
  p_sort text default 'newest',
  p_page integer default 1,
  p_page_size integer default 10,
  p_recent_only boolean default false,
  p_photos_only boolean default false
)
returns table(
  id uuid,
  category text,
  title text,
  content text,
  author_id uuid,
  image_paths text[],
  view_count bigint,
  created_at timestamptz,
  updated_at timestamptz,
  like_count bigint,
  comment_count bigint,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $browse$
  with filtered as (
    select
      p.id,
      p.category::text as category,
      p.title::text as title,
      p.content::text as content,
      p.author_id,
      coalesce(p.image_paths, '{}'::text[]) as image_paths,
      coalesce(p.view_count, 0)::bigint as view_count,
      p.created_at,
      p.updated_at,
      (select count(*) from public.tortoise_post_likes l where l.post_id=p.id)::bigint as like_count,
      (select count(*) from public.tortoise_comments c where c.post_id=p.id)::bigint as comment_count,
      count(*) over()::bigint as total_count
    from public.tortoise_posts p
    where
      (coalesce(p_category, 'all')='all' or p.category::text=p_category)
      and (
        nullif(trim(coalesce(p_query, '')), '') is null
        or position(lower(trim(p_query)) in lower(coalesce(p.title,'') || ' ' || coalesce(p.content,''))) > 0
      )
      and (not coalesce(p_recent_only,false) or p.created_at >= now()-interval '7 days')
      and (not coalesce(p_photos_only,false) or cardinality(coalesce(p.image_paths,'{}'::text[]))>0)
      and (
        auth.uid() is null
        or p.author_id is null
        or not exists (
          select from public.lt_blocks b
          where b.owner_id=(select auth.uid()) and b.member_id=p.author_id
        )
      )
  )
  select
    f.id,f.category,f.title,f.content,f.author_id,f.image_paths,f.view_count,
    f.created_at,f.updated_at,f.like_count,f.comment_count,f.total_count
  from filtered f
  order by
    case when p_sort='oldest' then f.created_at end asc nulls last,
    case when p_sort='popular' then f.like_count end desc nulls last,
    case when p_sort='popular' then f.view_count end desc nulls last,
    case when p_sort='views' then f.view_count end desc nulls last,
    case when p_sort='newest' then f.created_at end desc nulls last,
    f.created_at desc,f.id desc
  limit least(greatest(coalesce(p_page_size,10),1),30)
  offset (greatest(coalesce(p_page,1),1)-1)*least(greatest(coalesce(p_page_size,10),1),30);
$browse$;

commit;
