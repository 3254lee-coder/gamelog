begin;
alter table public.tortoise_posts alter column author_id drop not null;
alter table public.lt_withdrawals add column started_at timestamptz;
drop policy cancel_request on public.lt_withdrawals;
create policy cancel_request on public.lt_withdrawals for delete to authenticated
using (owner_id = (select auth.uid()) and started_at is null);

-- Storage writes and the worker take the same per-user lock. An upload already in
-- progress finishes before the first inventory; a later upload sees the claim.
create function public.lt_check_photo_write() returns trigger
language plpgsql security definer set search_path = '' as $$
declare member uuid := auth.uid();
begin
  if member is not null and new.bucket_id in ('tortoise-growth-photos','tortoise-post-images') then
    perform pg_advisory_xact_lock(hashtextextended(member::text, 0));
    if not exists(select from auth.users where id=member) or exists
      (select from public.lt_withdrawals where owner_id=member and started_at is not null) then
      raise exception 'account no longer accepts uploads';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.lt_check_photo_write() from public,anon,authenticated;
create trigger lt_check_photo_write before insert or update on storage.objects
for each row execute function public.lt_check_photo_write();

-- Accept only a pre-existing, reauthenticated request. Never create a request here.
create function public.lt_withdrawal_photos(member uuid) returns table(bucket text,path text)
language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(member::text, 0));
  update public.lt_withdrawals set started_at=coalesce(started_at,now()) where owner_id=member;
  if not found then raise exception 'no verified withdrawal request'; end if;
  if exists(select from storage.objects o where o.bucket_id in ('tortoise-growth-photos','tortoise-post-images')
    and ((split_part(o.name,'/',1)=member::text and o.owner_id is distinct from member::text)
      or (o.owner_id=member::text and split_part(o.name,'/',1)<>member::text))) then
    raise exception 'photo ownership needs review';
  end if;
  return query select o.bucket_id,o.name from storage.objects o
    where o.bucket_id in ('tortoise-growth-photos','tortoise-post-images')
      and split_part(o.name,'/',1)=member::text order by o.bucket_id,o.name limit 100;
end;
$$;
revoke all on function public.lt_withdrawal_photos(uuid) from public,anon,authenticated;
grant execute on function public.lt_withdrawal_photos(uuid) to service_role;

-- Run content cleanup in the same transaction as Auth deletion and its FK cascades.
create function public.lt_finish_withdrawal() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select from public.lt_withdrawals where owner_id=old.id and started_at is not null) then
    return old;
  end if;
  if exists(select from storage.objects where bucket_id in ('tortoise-growth-photos','tortoise-post-images')
    and (owner_id=old.id::text or split_part(name,'/',1)=old.id::text)) then
    raise exception 'photo cleanup incomplete';
  end if;
  lock table public.tortoise_posts, public.tortoise_comments in share row exclusive mode;
  -- Keep every ancestor of another member's comment, including older tombstones.
  with recursive keep(id) as (
    select parent_id from public.tortoise_comments where parent_id is not null and author_id is distinct from old.id
    union
    select c.parent_id from public.tortoise_comments c join keep k on k.id=c.id where c.parent_id is not null
  )
  delete from public.tortoise_comments c where c.author_id=old.id and not exists(select from keep where id=c.id);
  update public.tortoise_comments set author_id=null,nickname='탈퇴한 회원',content='탈퇴한 회원의 댓글입니다.'
    where author_id=old.id;
  delete from public.tortoise_posts p where p.author_id=old.id and not exists
    (select from public.tortoise_comments c where c.post_id=p.id);
  update public.tortoise_notifications n set post_title='탈퇴한 회원의 글'
    where exists(select from public.tortoise_posts p where p.id=n.post_id and p.author_id=old.id);
  delete from public.tortoise_pinned_posts pin using public.tortoise_posts p where pin.post_id=p.id and p.author_id=old.id;
  update public.tortoise_posts set author_id=null,title='탈퇴한 회원의 글',content='작성자가 탈퇴하여 내용이 삭제되었습니다.',image_paths='{}'
    where author_id=old.id;
  delete from public.lt_reports where kind='member' and target=old.id;
  return old;
end;
$$;
revoke all on function public.lt_finish_withdrawal() from public,anon,authenticated;
create trigger lt_finish_withdrawal before delete on auth.users for each row execute function public.lt_finish_withdrawal();
commit;
