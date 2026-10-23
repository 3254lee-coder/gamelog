-- Supabase SQL Editor에서 실행하세요. 로그인된 회원만 리뷰를 쓰고 자신의 리뷰만 수정/삭제할 수 있습니다.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null check (length(game_id) between 1 and 100),
  score numeric(3,1) not null check (score >= 0.5 and score <= 10 and score * 2 = trunc(score * 2)),
  title text not null check (char_length(trim(title)) between 1 and 120),
  body text not null check (char_length(trim(body)) between 10 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, game_id)
);
create index if not exists reviews_game_id_created_idx on public.reviews(game_id, created_at desc);
alter table public.reviews enable row level security;
drop policy if exists "Anyone can read reviews" on public.reviews;
create policy "Anyone can read reviews" on public.reviews for select to anon, authenticated using (true);
drop policy if exists "Users can create own reviews" on public.reviews;
create policy "Users can create own reviews" on public.reviews for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update own reviews" on public.reviews;
create policy "Users can update own reviews" on public.reviews for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete own reviews" on public.reviews;
create policy "Users can delete own reviews" on public.reviews for delete to authenticated using ((select auth.uid()) = user_id);
create or replace function public.touch_review_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at before update on public.reviews for each row execute function public.touch_review_updated_at();
