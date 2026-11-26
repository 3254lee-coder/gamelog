-- 단일 읽기 전용 조회. 회원 행, 파일명, 함수 본문, 정책 조건의 리터럴은 반환하지 않습니다.
with rel as (
 select c.oid,c.relname,c.relrowsecurity,c.relforcerowsecurity,n.nspname from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where (n.nspname='public' and (c.relname like 'tortoise%' or c.relname like 'lt_%')) or (n.nspname='storage' and c.relname='objects')
), roles(role_name) as (values ('anon'),('authenticated'))
select jsonb_build_object(
 'relations',(select jsonb_agg(to_jsonb(r)-'oid') from rel r),
 'columns',(select jsonb_agg(jsonb_build_array(r.relname,a.attname,format_type(a.atttypid,a.atttypmod),a.attnotnull)) from rel r join pg_attribute a on a.attrelid=r.oid and a.attnum>0 and not a.attisdropped),
 'constraints',(select jsonb_agg(jsonb_build_array(r.relname,c.conname,pg_get_constraintdef(c.oid))) from rel r join pg_constraint c on c.conrelid=r.oid where c.contype in ('p','f','u')),
 'indexes',(select jsonb_agg(jsonb_build_array(r.relname,i.indexname,i.indexdef)) from rel r join pg_indexes i on (i.schemaname,i.tablename)=(r.nspname,r.relname)),
 'policies',(select jsonb_agg(jsonb_build_array(p.tablename,p.policyname,p.cmd,p.roles,p.permissive)) from pg_policies p join rel r on (r.nspname,r.relname)=(p.schemaname,p.tablename)),
 'table_access',(select jsonb_agg(jsonb_build_array(r.relname,role_name,op,has_table_privilege(role_name,r.oid,op))) from rel r cross join roles cross join unnest(array['SELECT','INSERT','UPDATE','DELETE']) op),
 'rpc',(select jsonb_agg(jsonb_build_array(p.proname,pg_get_function_identity_arguments(p.oid),p.prosecdef,role_name,has_function_privilege(role_name,p.oid,'execute'))) from pg_proc p join pg_namespace n on n.oid=p.pronamespace cross join roles where n.nspname='public' and p.proname like '%tortoise%'),
 'triggers',(select jsonb_agg(jsonb_build_array(r.relname,t.tgname,t.tgfoid::regprocedure::text)) from rel r join pg_trigger t on t.tgrelid=r.oid where not t.tgisinternal),
 'buckets',(select jsonb_agg(jsonb_build_array(id,public,file_size_limit,allowed_mime_types)) from storage.buckets where id in ('tortoise-post-images','tortoise-growth-photos'))
) as service_metadata;
