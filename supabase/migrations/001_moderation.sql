begin;
create table public.lt_reports (
 id uuid primary key default gen_random_uuid(),
 reporter uuid not null default auth.uid() references auth.users on delete cascade,
 kind text not null check(kind in ('post','comment','member')),
 target uuid not null, reason text not null check(length(trim(reason)) between 1 and 500),
 status text not null default 'pending' check(status in ('pending','resolved','dismissed')),
 created_at timestamptz not null default now(), unique(reporter,kind,target)
);
create table public.lt_blocks (
 owner_id uuid not null default auth.uid() references auth.users on delete cascade,
 member_id uuid not null references auth.users on delete cascade,
 primary key(owner_id,member_id), check(owner_id<>member_id)
);
create table public.lt_withdrawals (
 owner_id uuid primary key default auth.uid() references auth.users on delete cascade,
 requested_at timestamptz not null default now()
);
alter table public.lt_reports enable row level security;
alter table public.lt_blocks enable row level security;
alter table public.lt_withdrawals enable row level security;
revoke all on public.lt_reports,public.lt_blocks,public.lt_withdrawals from public,anon,authenticated;
grant insert(kind,target,reason) on public.lt_reports to authenticated;
grant select(id,kind,target,reason,status,created_at),update(status) on public.lt_reports to authenticated;
create policy report_submit on public.lt_reports for insert to authenticated with check(reporter=(select auth.uid()) and status='pending');
create policy report_review on public.lt_reports for select to authenticated using ((select auth.uid())='5226f8c2-84ca-4189-b2a1-3a569bd3205c');
create policy report_decide on public.lt_reports for update to authenticated using ((select auth.uid())='5226f8c2-84ca-4189-b2a1-3a569bd3205c') with check ((select auth.uid())='5226f8c2-84ca-4189-b2a1-3a569bd3205c');
create index lt_report_queue on public.lt_reports(status,created_at desc);
grant select(member_id),insert(member_id),delete on public.lt_blocks to authenticated;
create policy own_blocks on public.lt_blocks for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
grant select(requested_at),insert(owner_id),delete on public.lt_withdrawals to authenticated;
create policy own_requests on public.lt_withdrawals for select to authenticated using(owner_id=(select auth.uid()));
create policy cancel_request on public.lt_withdrawals for delete to authenticated using(owner_id=(select auth.uid()));
create policy verified_request on public.lt_withdrawals for insert to authenticated with check(owner_id=(select auth.uid()) and exists (
 select 1 from jsonb_array_elements(auth.jwt()->'amr') m where m->>'method'='password' and (m->>'timestamp')::bigint between extract(epoch from now())-300 and extract(epoch from now())+30
));
commit;
