begin;
alter table public.lt_withdrawals add column prepared_at timestamptz;

-- Persist the privacy transformation before irreversible Storage deletion.
create function public.lt_prepare_withdrawal(member uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(member::text,0));
  update public.lt_withdrawals set started_at=coalesce(started_at,now())
    where owner_id=member and prepared_at is null;
  if not found then
    if exists(select from public.lt_withdrawals where owner_id=member and prepared_at is not null) then return; end if;
    raise exception 'no verified withdrawal request';
  end if;
  lock table public.tortoise_posts, public.tortoise_comments in share row exclusive mode;
  with recursive keep(id) as (
    select parent_id from public.tortoise_comments
      where parent_id is not null and author_id is distinct from member
    union
    select c.parent_id from public.tortoise_comments c join keep k on k.id=c.id
      where c.parent_id is not null
  )
  delete from public.tortoise_comments c where c.author_id=member
    and not exists(select from keep where id=c.id);
  update public.tortoise_comments set author_id=null,nickname='탈퇴한 회원',
    content='탈퇴한 회원의 댓글입니다.' where author_id=member;
  delete from public.tortoise_posts p where p.author_id=member
    and not exists(select from public.tortoise_comments c where c.post_id=p.id);
  update public.tortoise_notifications n set post_title='탈퇴한 회원의 글'
    where exists(select from public.tortoise_posts p where p.id=n.post_id and p.author_id=member);
  delete from public.tortoise_pinned_posts pin using public.tortoise_posts p
    where pin.post_id=p.id and p.author_id=member;
  update public.tortoise_posts set author_id=null,title='탈퇴한 회원의 글',
    content='작성자가 탈퇴하여 내용이 삭제되었습니다.',image_paths='{}'
    where author_id=member;
  delete from public.tortoise_post_likes where user_id=member;
  delete from public.tortoise_growth_records where user_id=member;
  delete from public.tortoises where user_id=member;
  -- Remove only the withdrawing member's own reports and private block edges.
  -- Reports authored by other members remain governed by the existing Auth trigger.
  delete from public.lt_reports where reporter=member;
  delete from public.lt_blocks
    where owner_id=member or member_id=member;
  update public.lt_withdrawals set prepared_at=now() where owner_id=member;
end;
$$;
revoke all on function public.lt_prepare_withdrawal(uuid) from public,anon,authenticated;
grant execute on function public.lt_prepare_withdrawal(uuid) to service_role;

create or replace function public.lt_withdrawal_photos(member uuid)
returns table(bucket text,path text)
language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(member::text,0));
  if not exists(select from public.lt_withdrawals where owner_id=member and prepared_at is not null) then
    raise exception 'withdrawal privacy preparation required';
  end if;
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

create or replace function public.lt_finish_withdrawal() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select from public.lt_withdrawals where owner_id=old.id and prepared_at is not null) then
    raise exception 'withdrawal privacy preparation required';
  end if;
  if exists(select from storage.objects where bucket_id in ('tortoise-growth-photos','tortoise-post-images')
    and (owner_id=old.id::text or split_part(name,'/',1)=old.id::text)) then
    raise exception 'photo cleanup incomplete';
  end if;
  delete from public.lt_reports where kind='member' and target=old.id;
  return old;
end;
$$;
commit;
