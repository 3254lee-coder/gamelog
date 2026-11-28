-- Disposable local test project only. Auth and Storage are supplied by Supabase.
create table public.tortoise_posts(id uuid primary key default gen_random_uuid(),author_id uuid not null references auth.users,title text not null,content text not null,image_paths text[] not null default '{}');
create table public.tortoise_comments(id uuid primary key default gen_random_uuid(),post_id uuid not null references public.tortoise_posts on delete cascade,parent_id uuid references public.tortoise_comments on delete cascade,author_id uuid references auth.users,nickname text not null,content text not null);
create table public.tortoise_notifications(id uuid primary key default gen_random_uuid(),recipient_id uuid references auth.users on delete cascade,post_id uuid references public.tortoise_posts on delete cascade,post_title text,read_at timestamptz);
create table public.tortoise_pinned_posts(post_id uuid primary key references public.tortoise_posts on delete cascade);
create table public.tortoises(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users on delete cascade,name text);
create table public.tortoise_growth_records(id uuid primary key default gen_random_uuid(),tortoise_id uuid references public.tortoises on delete cascade,user_id uuid references auth.users on delete cascade,memo text);
create table public.lt_test_hold(owner_id uuid references auth.users);
alter table public.tortoise_posts enable row level security;
alter table public.tortoise_comments enable row level security;
create policy posts_public_read on public.tortoise_posts for select to authenticated using(true);
create policy own_posts on public.tortoise_posts for insert to authenticated with check(author_id=auth.uid());
create policy comments_public_read on public.tortoise_comments for select to authenticated using(true);
create policy own_comments on public.tortoise_comments for insert to authenticated with check(author_id=auth.uid());
grant select,insert on public.tortoise_posts,public.tortoise_comments to authenticated;
grant all on all tables in schema public to service_role;
create policy fixture_upload on storage.objects for insert to authenticated with check (bucket_id in ('tortoise-growth-photos','tortoise-post-images') and (storage.foldername(name))[1]=auth.uid()::text);

-- Failure injection, local fixture only. Exercise Storage's real DELETE endpoint.
create table public.lt_test_storage_hold(owner_id uuid primary key);
revoke all on public.lt_test_storage_hold from public, anon, authenticated;
grant all on public.lt_test_storage_hold to service_role;
create function public.lt_test_fail_photo_delete() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if exists(select from public.lt_test_storage_hold where owner_id::text=old.owner_id) then
    raise exception 'fixture: storage unavailable';
  end if;
  return old;
end;
$$;
create trigger lt_test_fail_photo_delete before delete on storage.objects
for each row execute function public.lt_test_fail_photo_delete();

-- My-page and notification projections used by browser smoke tests.
alter table public.tortoise_posts add column category text default 'free', add column created_at timestamptz default now();
alter table public.tortoise_comments add column created_at timestamptz default now();
alter table public.tortoise_notifications
  add column comment_id uuid not null,
  add column kind text not null,
  add column created_at timestamptz not null default now();
alter table public.tortoise_notifications
  add constraint tortoise_notifications_comment_id_fkey
    foreign key(comment_id) references public.tortoise_comments on delete cascade,
  add constraint tortoise_notifications_recipient_id_comment_id_key
    unique(recipient_id,comment_id);
create table public.tortoise_post_likes(post_id uuid references public.tortoise_posts on delete cascade,user_id uuid references auth.users on delete cascade,created_at timestamptz default now(),primary key(post_id,user_id));
grant select on public.tortoise_post_likes to authenticated;


-- Production-shaped feature schema for web regression coverage. The catalog
-- metadata came from the read-only production preflight; no production data is copied.
alter table public.tortoise_posts
  add column updated_at timestamptz not null default now(),
  add column view_count bigint not null default 0,
  add constraint tortoise_posts_category_check check (category in ('free','tips','question')),
  add constraint tortoise_posts_title_check check (char_length(trim(title)) between 2 and 100),
  add constraint tortoise_posts_content_check check (char_length(trim(content)) between 1 and 20000);
alter table public.tortoise_comments
  add column updated_at timestamptz not null default now(),
  add constraint tortoise_comments_content_check check (char_length(trim(content)) between 1 and 2000),
  add constraint tortoise_comments_nickname_check check (char_length(trim(nickname)) between 2 and 20);
alter table public.tortoise_pinned_posts add column pinned_at timestamptz not null default now();
alter table public.tortoises
  add column species text,
  add column birth_date date,
  add column adoption_date date,
  add column photo_path text,
  add column created_at timestamptz not null default now();
alter table public.tortoise_growth_records
  add column measured_on date not null default current_date,
  add column weight_g numeric(10,2),
  add column shell_length_cm numeric(8,2),
  add column photo_path text,
  add column created_at timestamptz not null default now(),
  add constraint growth_measurement_present check (weight_g is not null or shell_length_cm is not null),
  add constraint growth_weight_positive check (weight_g is null or weight_g > 0),
  add constraint growth_shell_positive check (shell_length_cm is null or shell_length_cm > 0);
alter table public.tortoise_notifications
  add constraint tortoise_notifications_kind_check check (kind in ('comment','reply'));

drop policy posts_public_read on public.tortoise_posts;
create policy posts_public_read on public.tortoise_posts for select to anon,authenticated using(true);
drop policy comments_public_read on public.tortoise_comments;
create policy comments_public_read on public.tortoise_comments for select to anon,authenticated using(true);
create policy own_posts_update on public.tortoise_posts for update to authenticated using(author_id=auth.uid()) with check(author_id=auth.uid());
create policy own_posts_delete on public.tortoise_posts for delete to authenticated using(author_id=auth.uid());
create policy own_comments_update on public.tortoise_comments for update to authenticated using(author_id=auth.uid()) with check(author_id=auth.uid());
create policy own_comments_delete on public.tortoise_comments for delete to authenticated using(author_id=auth.uid());
grant select on public.tortoise_posts,public.tortoise_comments to anon;
grant update,delete on public.tortoise_posts,public.tortoise_comments to authenticated;

alter table public.tortoise_post_likes enable row level security;
create policy read_likes on public.tortoise_post_likes for select to anon,authenticated using(true);
create policy own_likes_insert on public.tortoise_post_likes for insert to authenticated with check(user_id=auth.uid());
create policy own_likes_delete on public.tortoise_post_likes for delete to authenticated using(user_id=auth.uid());
grant select,insert,delete on public.tortoise_post_likes to anon,authenticated;

alter table public.tortoise_notifications enable row level security;
create policy own_notifications_read on public.tortoise_notifications for select to authenticated using(recipient_id=auth.uid());
create policy own_notifications_update on public.tortoise_notifications for update to authenticated using(recipient_id=auth.uid()) with check(recipient_id=auth.uid());
grant select,update on public.tortoise_notifications to authenticated;

alter table public.tortoises enable row level security;
create policy own_tortoises_select on public.tortoises for select to authenticated using(user_id=auth.uid());
create policy own_tortoises_insert on public.tortoises for insert to authenticated with check(user_id=auth.uid());
create policy own_tortoises_update on public.tortoises for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_tortoises_delete on public.tortoises for delete to authenticated using(user_id=auth.uid());
grant select,insert,update,delete on public.tortoises to authenticated;

alter table public.tortoise_growth_records enable row level security;
create policy own_growth_select on public.tortoise_growth_records for select to authenticated using(user_id=auth.uid());
create policy own_growth_insert on public.tortoise_growth_records for insert to authenticated with check(user_id=auth.uid());
create policy own_growth_update on public.tortoise_growth_records for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_growth_delete on public.tortoise_growth_records for delete to authenticated using(user_id=auth.uid());
grant select,insert,update,delete on public.tortoise_growth_records to authenticated;

create policy fixture_owner_select on storage.objects for select to authenticated using(owner_id=(select auth.uid())::text);
create policy fixture_owner_update on storage.objects for update to authenticated
  using(owner_id=(select auth.uid())::text)
  with check(owner_id=(select auth.uid())::text and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy fixture_owner_delete on storage.objects for delete to authenticated using(owner_id=(select auth.uid())::text);

create function public.browse_tortoise_posts(
  p_category text,p_query text,p_sort text,p_page integer,p_page_size integer,
  p_recent_only boolean,p_photos_only boolean
) returns table(
  id uuid,category text,title text,content text,author_id uuid,image_paths text[],
  view_count bigint,created_at timestamptz,updated_at timestamptz,
  like_count bigint,comment_count bigint,total_count bigint
) language sql stable set search_path='' as $$
  with filtered as (
    select p.id,p.category,p.title,p.content,p.author_id,p.image_paths,p.view_count,p.created_at,p.updated_at,
      (select count(*) from public.tortoise_post_likes l where l.post_id=p.id)::bigint as likes,
      (select count(*) from public.tortoise_comments c where c.post_id=p.id)::bigint as comments
    from public.tortoise_posts p
    where (p_category='all' or p.category=p_category)
      and (coalesce(p_query,'')='' or p.title ilike '%'||p_query||'%' or p.content ilike '%'||p_query||'%')
      and (not coalesce(p_recent_only,false) or p.created_at>=now()-interval '7 days')
      and (not coalesce(p_photos_only,false) or cardinality(p.image_paths)>0)
  )
  select f.id,f.category,f.title,f.content,f.author_id,f.image_paths,f.view_count,f.created_at,f.updated_at,
    f.likes,f.comments,count(*) over()::bigint
  from filtered f
  order by
    case when p_sort='popular' then f.likes end desc nulls last,
    case when p_sort='views' then f.view_count end desc nulls last,
    case when p_sort='oldest' then f.created_at end asc nulls last,
    case when p_sort not in ('popular','views','oldest') then f.created_at end desc nulls last
  limit greatest(coalesce(p_page_size,20),1)
  offset greatest(coalesce(p_page,1)-1,0)*greatest(coalesce(p_page_size,20),1)
$$;
grant execute on function public.browse_tortoise_posts(text,text,text,integer,integer,boolean,boolean) to anon,authenticated;

create function public.get_tortoise_post_authors(p_post_ids uuid[])
returns table(post_id uuid,nickname text)
language sql stable security definer set search_path='' as $$
  select p.id,coalesce(u.raw_user_meta_data->>'nickname','회원')
  from public.tortoise_posts p join auth.users u on u.id=p.author_id
  where p.id=any(p_post_ids)
$$;
grant execute on function public.get_tortoise_post_authors(uuid[]) to anon,authenticated;

create function public.increment_tortoise_post_view(target_post_id uuid)
returns bigint language plpgsql security definer set search_path='' as $$
declare views bigint;
begin
  update public.tortoise_posts set view_count=view_count+1 where id=target_post_id returning view_count into views;
  return views;
end;
$$;
grant execute on function public.increment_tortoise_post_view(uuid) to anon,authenticated;


-- Exact production validate_tortoise_reply function definition supplied by the
-- user from a read-only production catalog query. Runs in disposable Supabase only.
create or replace function public.validate_tortoise_reply()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  parent_post uuid;
  parent_parent uuid;
begin
  if tg_op = 'UPDATE' then
    if new.parent_id is distinct from old.parent_id
       or new.post_id is distinct from old.post_id then
      raise exception '댓글의 연결 관계는 변경할 수 없습니다.';
    end if;

    return new;
  end if;

  if new.parent_id is null then
    return new;
  end if;

  select post_id, parent_id
  into parent_post, parent_parent
  from public.tortoise_comments
  where id = new.parent_id;

  if not found then
    raise exception '원댓글이 존재하지 않습니다.';
  end if;

  if parent_post is distinct from new.post_id then
    raise exception '같은 게시글에만 답글을 작성할 수 있습니다.';
  end if;

  if parent_parent is not null then
    raise exception '대댓글은 1단계까지만 작성할 수 있습니다.';
  end if;

  return new;
end;
$function$;

create trigger validate_tortoise_reply_trigger
before insert or update on public.tortoise_comments
for each row execute function public.validate_tortoise_reply();

-- Production AFTER INSERT notification trigger. Keep this fixture aligned with
-- the operational definition so tests exercise the real automatic flow.
create or replace function public.create_tortoise_notification()
returns trigger
language plpgsql
security definer
set search_path to ''
as $notification$
declare
  post_owner uuid;
  parent_owner uuid;
  current_title text;
begin
  if new.author_id is null then return new; end if;

  select author_id,title into post_owner,current_title
  from public.tortoise_posts where id=new.post_id;

  if new.parent_id is not null then
    select author_id into parent_owner
    from public.tortoise_comments where id=new.parent_id;
    if parent_owner is not null and parent_owner<>new.author_id then
      insert into public.tortoise_notifications(recipient_id,post_id,comment_id,kind,post_title)
      values(parent_owner,new.post_id,new.id,'reply',current_title)
      on conflict(recipient_id,comment_id) do nothing;
    end if;
  end if;

  if post_owner is not null and post_owner<>new.author_id then
    insert into public.tortoise_notifications(recipient_id,post_id,comment_id,kind,post_title)
    values(post_owner,new.post_id,new.id,'comment',current_title)
    on conflict(recipient_id,comment_id) do nothing;
  end if;
  return new;
end;
$notification$;

create trigger create_tortoise_notification_trigger
after insert on public.tortoise_comments
for each row execute function public.create_tortoise_notification();

-- Test-only dashboard RPC contract with the same role check and JSON keys as
-- production. The fixture contains generated test accounts only.
create or replace function public.get_tortoise_admin_dashboard()
returns jsonb
language plpgsql
security definer
set search_path to ''
as $dashboard$
declare
  today_kst date := (now() at time zone 'Asia/Seoul')::date;
  result jsonb;
begin
  if auth.uid() is distinct from '5226f8c2-84ca-4189-b2a1-3a569bd3205c'::uuid then
    raise exception '관리자 권한이 필요합니다.' using errcode='42501';
  end if;

  select jsonb_build_object(
    'members',(select count(*) from auth.users),
    'members_today',(select count(*) from auth.users where (created_at at time zone 'Asia/Seoul')::date=today_kst),
    'members_week',(select count(*) from auth.users where (created_at at time zone 'Asia/Seoul')::date between today_kst-6 and today_kst),
    'posts',(select count(*) from public.tortoise_posts),
    'comments',(select count(*) from public.tortoise_comments),
    'replies',(select count(*) from public.tortoise_comments where parent_id is not null),
    'likes',(select count(*) from public.tortoise_post_likes),
    'turtles',(select count(*) from public.tortoises),
    'growth_records',(select count(*) from public.tortoise_growth_records),
    'notices',(select count(*) from public.tortoise_pinned_posts),
    'recent_members',(
      select coalesce(jsonb_agg(to_jsonb(m) order by m.created_at desc),'[]'::jsonb)
      from (
        select coalesce(nullif(raw_user_meta_data->>'nickname',''),nullif(raw_user_meta_data->>'display_name',''),nullif(raw_user_meta_data->>'name',''),'회원') as nickname,
          created_at,last_sign_in_at
        from auth.users order by created_at desc limit 50
      ) m
    ),
    'recent_posts',(
      select coalesce(jsonb_agg(to_jsonb(p) order by p.created_at desc),'[]'::jsonb)
      from (select id,title,category,view_count,created_at from public.tortoise_posts order by created_at desc limit 20) p
    ),
    'recent_comments',(
      select coalesce(jsonb_agg(to_jsonb(c) order by c.created_at desc),'[]'::jsonb)
      from (
        select c.id,c.post_id,c.parent_id,c.nickname,left(c.content,200) as content,c.created_at,p.title as post_title
        from public.tortoise_comments c join public.tortoise_posts p on p.id=c.post_id
        order by c.created_at desc limit 20
      ) c
    ),
    'pinned_posts',(
      select coalesce(jsonb_agg(to_jsonb(n) order by n.pinned_at desc),'[]'::jsonb)
      from (
        select p.id,p.title,pin.pinned_at
        from public.tortoise_pinned_posts pin join public.tortoise_posts p on p.id=pin.post_id
        order by pin.pinned_at desc limit 50
      ) n
    ),
    'daily_activity',(
      select coalesce(jsonb_agg(jsonb_build_object(
        'date',days.day::date,
        'members',(select count(*) from auth.users u where (u.created_at at time zone 'Asia/Seoul')::date=days.day::date),
        'posts',(select count(*) from public.tortoise_posts p where (p.created_at at time zone 'Asia/Seoul')::date=days.day::date),
        'comments',(select count(*) from public.tortoise_comments c where (c.created_at at time zone 'Asia/Seoul')::date=days.day::date)
      ) order by days.day),'[]'::jsonb)
      from generate_series((today_kst-6)::timestamp,today_kst::timestamp,interval '1 day') days(day)
    )
  ) into result;

  return result;
end;
$dashboard$;
revoke all on function public.get_tortoise_admin_dashboard() from public,anon;
grant execute on function public.get_tortoise_admin_dashboard() to authenticated;
