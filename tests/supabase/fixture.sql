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
create policy read_posts on public.tortoise_posts for select to authenticated using(true);
create policy own_posts on public.tortoise_posts for insert to authenticated with check(author_id=auth.uid());
create policy read_comments on public.tortoise_comments for select to authenticated using(true);
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
alter table public.tortoise_notifications add column comment_id uuid, add column kind text, add column created_at timestamptz default now();
create table public.tortoise_post_likes(post_id uuid references public.tortoise_posts on delete cascade,user_id uuid references auth.users on delete cascade,created_at timestamptz default now(),primary key(post_id,user_id));
grant select on public.tortoise_post_likes to authenticated;
