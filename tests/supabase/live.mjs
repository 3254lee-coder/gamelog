import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { processVerifiedWithdrawal } from "../../lib/withdrawal-runner.mjs";

const url = process.env.API_URL;
assert.ok(["http://127.0.0.1:54321","http://localhost:54321"].includes(url));
const options = {auth:{persistSession:false,autoRefreshToken:false}};
const admin = createClient(url,process.env.SERVICE_ROLE_KEY,options);
function ok(result) { if (result.error) throw result.error; return result.data; }
async function member(label) {
  const client = createClient(url,process.env.ANON_KEY,options);
  const email=label+"-"+randomUUID()+"@example.test",password=randomUUID()+"Aa!";
  const {user}=ok(await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{nickname:label}}));
  ok(await client.auth.signInWithPassword({email,password}));
  return {client,id:user.id,email};
}
const A=await member("fixture-a"), B=await member("fixture-b");
for(const bucket of ["tortoise-growth-photos","tortoise-post-images"]) ok(await admin.storage.createBucket(bucket));
function upload(m,bucket,name){return m.client.storage.from(bucket).upload(m.id+"/"+name,new Uint8Array([1,2,3]),{contentType:"image/png"})}
const gallery="tortoise-post-images",diary="tortoise-growth-photos";
ok(await upload(A,gallery,"post.png"));ok(await upload(A,diary,"growth.png"));ok(await upload(B,gallery,"keep.png"));
const post=ok(await A.client.from("tortoise_posts").insert({author_id:A.id,title:"A original",content:"A private text",image_paths:[A.id+"/post.png"]}).select().single());
const bPost=ok(await B.client.from("tortoise_posts").insert({author_id:B.id,title:"B original",content:"B post remains",image_paths:[B.id+"/keep.png"]}).select().single());
assert.equal(ok(await A.client.rpc("increment_tortoise_post_view",{target_post_id:bPost.id})),1);
const parent=ok(await A.client.from("tortoise_comments").insert({author_id:A.id,post_id:post.id,nickname:"회원 A",content:"parent"}).select().single());
const reply=ok(await B.client.from("tortoise_comments").insert({author_id:B.id,post_id:post.id,parent_id:parent.id,nickname:"회원 B",content:"B reply"}).select().single());
const automaticNotice=ok(await A.client.from("tortoise_notifications")
  .select("id,comment_id").eq("recipient_id",A.id).eq("comment_id",reply.id));
assert.ok(automaticNotice.length>0,"B's reply should notify A automatically");
ok(await A.client.from("lt_blocks").insert({member_id:B.id}));
const blockedNoticeFilter=await A.client.from("tortoise_notifications")
  .select("id,comment:tortoise_comments!tortoise_notifications_comment_id_fkey!inner(author_id)")
  .eq("recipient_id",A.id).not("comment.author_id","in",`(${B.id})`);
assert.ok(!blockedNoticeFilter.error,blockedNoticeFilter.error?.message);
assert.ok(!blockedNoticeFilter.data.some(row=>row.comment?.author_id===B.id));
const turtle=ok(await admin.from("tortoises").insert({user_id:A.id,name:"A turtle"}).select().single());
ok(await admin.from("tortoise_growth_records").insert({user_id:A.id,tortoise_id:turtle.id,measured_on:"2026-11-27",weight_g:250,memo:"A diary"}));
const report=(target)=>B.client.from("lt_reports").insert({kind:"post",target,reason:"fixture"});
ok(await report(post.id));assert.equal((await report(post.id)).error?.code,"23505");
const adminUid="5226f8c2-84ca-4189-b2a1-3a569bd3205c";
const moderationAdmin=createClient(url,process.env.ANON_KEY,options);
const adminEmail="isolated-admin-"+randomUUID()+"@example.test";
const adminPassword=randomUUID()+"Aa!";
ok(await admin.auth.admin.createUser({id:adminUid,email:adminEmail,password:adminPassword,email_confirm:true}));
ok(await moderationAdmin.auth.signInWithPassword({email:adminEmail,password:adminPassword}));
const ordinaryDashboard=await A.client.rpc("get_tortoise_admin_dashboard");
assert.equal(ordinaryDashboard.error?.code,"42501");
const dashboard=ok(await moderationAdmin.rpc("get_tortoise_admin_dashboard"));
for(const key of ["members","members_today","members_week","posts","comments","replies","likes","turtles","growth_records","notices","recent_members","recent_posts","recent_comments","pinned_posts","daily_activity"])
  assert.ok(Object.hasOwn(dashboard,key),`dashboard missing ${key}`);
assert.equal(dashboard.daily_activity.length,7);
assert.ok(dashboard.recent_members.every(row=>!Object.hasOwn(row,"email")&&!Object.hasOwn(row,"id")));
assert.deepEqual(ok(await A.client.from("lt_reports").select("id,status").eq("target",post.id)),[]);
const queuedReport=ok(await moderationAdmin.from("lt_reports").select("id,status").eq("target",post.id).single());
assert.equal(queuedReport.status,"pending");
assert.equal(ok(await moderationAdmin.from("lt_reports").update({status:"resolved"}).eq("id",queuedReport.id).select("status").single()).status,"resolved");

const blockedAdminAccountDelete=await admin.auth.admin.deleteUser(adminUid);
assert.ok(blockedAdminAccountDelete.error);
assert.equal(ok(await admin.auth.admin.getUserById(adminUid)).user.id,adminUid);
console.log("PASS: isolated administrator can review and resolve reports; members cannot read the moderation queue");

assert.deepEqual(ok(await B.client.from("lt_reports").select("id,status")),[]);
assert.ok((await B.client.from("lt_reports").select("reporter")).error);
ok(await B.client.from("lt_blocks").insert({member_id:A.id}));
assert.deepEqual(ok(await A.client.from("lt_blocks").select("member_id")),[{member_id:B.id}]);
assert.deepEqual(ok(await B.client.from("lt_blocks").select("member_id")),[{member_id:A.id}]);
ok(await B.client.from("lt_blocks").delete().eq("member_id",A.id));
assert.deepEqual(ok(await B.client.from("lt_blocks").select("member_id")),[]);
const targets=ok(await A.client.from("tortoise_posts").insert(Array.from({length:10},()=>({author_id:A.id,title:"fixture",content:"fixture"}))).select("id"));
for(const row of targets.slice(0,9))ok(await report(row.id));
assert.equal((await report(targets[9].id)).error?.code,"PT429");
console.log("PASS: report quota, duplicate reports, reporter privacy, block isolation and unblock");

const editTarget=ok(await A.client.from("tortoise_posts").insert({
  author_id:A.id,title:"수정 전 제목",content:"수정 전 본문"
}).select("id").single());
ok(await A.client.from("tortoise_posts").update({
  title:"수정된 제목",content:"수정된 본문"
}).eq("id",editTarget.id).eq("author_id",A.id).select("id").single());
const deniedEdit=await B.client.from("tortoise_posts").update({title:"권한 없는 변경"})
  .eq("id",editTarget.id).select("id");
assert.deepEqual(ok(deniedEdit),[]);
ok(await A.client.from("tortoise_posts").delete().eq("id",editTarget.id).select("id").single());
assert.deepEqual(ok(await admin.from("tortoise_posts").select("id").eq("id",editTarget.id)),[]);
const searchResult=ok(await A.client.rpc("browse_tortoise_posts",{
  p_category:"all",p_query:"A original",p_sort:"newest",p_page:1,p_page_size:20,
  p_recent_only:false,p_photos_only:false
}));
assert.ok(searchResult.some(row=>row.id===post.id));
ok(await B.client.from("tortoise_post_likes").insert({post_id:post.id,user_id:B.id}));
assert.equal(ok(await B.client.from("tortoise_post_likes").select("post_id").eq("post_id",post.id)).length,1);
const popularity=ok(await A.client.rpc("browse_tortoise_posts",{
  p_category:"all",p_query:"A original",p_sort:"popular",p_page:1,p_page_size:20,
  p_recent_only:false,p_photos_only:false
}));
assert.equal(popularity[0]?.like_count,1);
ok(await admin.from("tortoise_posts").insert([
  {author_id:A.id,category:"free",title:"정렬 회귀 오래된 글",content:"오래된 테스트 글",created_at:"2020-01-01T00:00:00Z",view_count:3},
  {author_id:A.id,category:"question",title:"정렬 회귀 최신 글",content:"최신 테스트 글",created_at:"2026-11-27T00:00:00Z",view_count:70}
]));
const sortArgs={p_category:"all",p_query:"정렬 회귀",p_page:1,p_page_size:20,p_recent_only:false,p_photos_only:false};
assert.equal(ok(await A.client.rpc("browse_tortoise_posts",{...sortArgs,p_sort:"oldest"}))[0].title,"정렬 회귀 오래된 글");
assert.equal(ok(await A.client.rpc("browse_tortoise_posts",{...sortArgs,p_sort:"newest"}))[0].title,"정렬 회귀 최신 글");
assert.equal(ok(await A.client.rpc("browse_tortoise_posts",{...sortArgs,p_sort:"views"}))[0].title,"정렬 회귀 최신 글");
assert.deepEqual(ok(await A.client.rpc("browse_tortoise_posts",{...sortArgs,p_category:"question",p_sort:"newest"})).map(row=>row.title),["정렬 회귀 최신 글"]);
const pageOne=ok(await A.client.rpc("browse_tortoise_posts",{
  ...sortArgs,p_sort:"newest",p_page:1,p_page_size:1
}));
const pageTwo=ok(await A.client.rpc("browse_tortoise_posts",{
  ...sortArgs,p_sort:"newest",p_page:2,p_page_size:1
}));
assert.equal(pageOne.length,1);assert.equal(pageTwo.length,1);
assert.notEqual(pageOne[0].id,pageTwo[0].id);
assert.equal(pageOne[0].total_count,2);assert.equal(pageTwo[0].total_count,2);
const anonymous=createClient(url,process.env.ANON_KEY,options);
const anonymousBrowse=ok(await anonymous.rpc("browse_tortoise_posts",{
  p_category:"all",p_query:"A original",p_sort:"newest",p_page:1,p_page_size:20,
  p_recent_only:false,p_photos_only:false
}));
assert.ok(anonymousBrowse.some(row=>row.id===bPost.id),"public browsing remains unchanged");
const hiddenPageTitle="blocked pagination fixture";
const visiblePagePost=ok(await A.client.from("tortoise_posts").insert({
  author_id:A.id,title:hiddenPageTitle+" visible",content:"visible row"
}).select("id").single());
ok(await B.client.from("tortoise_posts").insert({
  author_id:B.id,title:hiddenPageTitle+" hidden",content:"blocked row"
}));
const visiblePage=ok(await A.client.rpc("browse_tortoise_posts",{
  p_category:"all",p_query:hiddenPageTitle,p_sort:"newest",p_page:1,p_page_size:1,
  p_recent_only:false,p_photos_only:false
}));
const hiddenPage=ok(await A.client.rpc("browse_tortoise_posts",{
  p_category:"all",p_query:hiddenPageTitle,p_sort:"newest",p_page:2,p_page_size:1,
  p_recent_only:false,p_photos_only:false
}));
assert.equal(visiblePage.length,1);assert.equal(visiblePage[0].id,visiblePagePost.id);
assert.equal(visiblePage[0].total_count,1);assert.deepEqual(hiddenPage,[]);
assert.ok(ok(await A.client.rpc("browse_tortoise_posts",{
  p_category:"all",p_query:"B original",p_sort:"newest",p_page:1,p_page_size:20,
  p_recent_only:false,p_photos_only:true
})).some(row=>row.id===bPost.id));

ok(await B.client.from("tortoise_post_likes").delete().eq("post_id",post.id).eq("user_id",B.id));

const notice=automaticNotice[0];
ok(await A.client.from("tortoise_notifications").update({read_at:new Date().toISOString()})
  .eq("id",notice.id).eq("recipient_id",A.id));
assert.ok(ok(await A.client.from("tortoise_notifications").select("read_at").eq("id",notice.id).single()).read_at);
assert.ok((await B.client.from("tortoise_notifications").update({post_title:"침범"}).eq("id",notice.id)).error);

const featureTurtle=ok(await A.client.from("tortoises").insert({
  user_id:A.id,name:"기능검증 거북이",species:"테스트 종"
}).select("id").single());
ok(await upload(A,diary,"feature-growth.png"));
const featureGrowth=ok(await A.client.from("tortoise_growth_records").insert({
  user_id:A.id,tortoise_id:featureTurtle.id,measured_on:"2026-11-27",weight_g:250,
  shell_length_cm:10.5,memo:"성장 기록 회귀",photo_path:A.id+"/feature-growth.png"
}).select("id").single());
ok(await A.client.from("tortoise_growth_records").update({memo:"성장 기록 수정 회귀"})
  .eq("id",featureGrowth.id).eq("user_id",A.id).select("id").single());
ok(await A.client.from("tortoise_growth_records").delete().eq("id",featureGrowth.id).eq("user_id",A.id).select("id").single());
ok(await A.client.from("tortoises").delete().eq("id",featureTurtle.id).eq("user_id",A.id).select("id").single());
ok(await A.client.storage.from(diary).remove([A.id+"/feature-growth.png"]));
console.log("PASS: post edit/delete ownership, like/unlike, browse search/popularity, notification read_at isolation and growth/photo CRUD");

const submit=()=>A.client.from("lt_withdrawals").insert({owner_id:A.id});
ok(await submit());assert.equal((await submit()).error?.code,"23505");
const prematurePhotos=await admin.rpc("lt_withdrawal_photos",{member:A.id});
assert.match(prematurePhotos.error?.message??"",/withdrawal privacy preparation required/);
assert.equal(ok(await admin.auth.admin.getUserById(A.id)).user.id,A.id);
console.log("PASS: photo inventory is denied before privacy preparation");

const C=await member("fixture-admin-delete");
ok(await upload(C,gallery,"untouched.png"));
const cPost=ok(await admin.from("tortoise_posts").insert({author_id:C.id,title:"C original",content:"C remains"}).select().single());
const directAdminDelete=await admin.auth.admin.deleteUser(C.id);
assert.ok(directAdminDelete.error);
assert.equal(ok(await admin.auth.admin.getUserById(C.id)).user.id,C.id);
assert.ok((await admin.storage.from(gallery).download(C.id+"/untouched.png")).data);
assert.equal(ok(await admin.from("tortoise_posts").select("content").eq("id",cPost.id).single()).content,"C remains");
console.log("PASS: direct administrator Auth deletion without a prepared request is blocked without data loss");

assert.ok(ok(await A.client.auth.getUser()).user.id===A.id);
ok(await admin.from("lt_test_hold").insert({owner_id:A.id}));
const [prepared,race]=await Promise.all([admin.rpc("lt_prepare_withdrawal",{member:A.id}),upload(A,gallery,"race.png")]);ok(prepared);
const late=await upload(A,gallery,"late.png");assert.ok(late.error);
console.log("Concurrent upload:",race.error?"blocked":"committed before preparation");
assert.ok(ok(await admin.from("lt_withdrawals").select("prepared_at").eq("owner_id",A.id).single()).prepared_at);
const activeSession=ok(await A.client.auth.getUser()).user;
assert.equal(activeSession.id,A.id);
function assertWithdrawalWriteBlocked(result) {
  assert.equal(result.error?.code,"P0001",result.error?.message);
  assert.match(result.error?.message??"",/account withdrawal is in progress/i);
}
assertWithdrawalWriteBlocked(await A.client.from("tortoise_posts").insert({
  author_id:A.id,title:"late post",content:"must be blocked"
}));
assertWithdrawalWriteBlocked(await A.client.rpc("increment_tortoise_post_view",{
  target_post_id:bPost.id
}));
assertWithdrawalWriteBlocked(await A.client.from("tortoise_comments").insert({
  author_id:A.id,post_id:bPost.id,nickname:"회원 A",content:"late comment"
}));
assertWithdrawalWriteBlocked(await A.client.from("tortoises").insert({
  user_id:A.id,name:"late turtle"
}));
assertWithdrawalWriteBlocked(await A.client.from("tortoise_growth_records").insert({
  user_id:A.id,tortoise_id:turtle.id,measured_on:"2026-11-27",weight_g:251
}));
assertWithdrawalWriteBlocked(await A.client.from("tortoise_post_likes").insert({
  post_id:bPost.id,user_id:A.id
}));
assertWithdrawalWriteBlocked(await A.client.from("lt_reports").insert({
  kind:"post",target:bPost.id,reason:"late report"
}));
assertWithdrawalWriteBlocked(await A.client.from("lt_blocks").insert({
  member_id:B.id
}));
assertWithdrawalWriteBlocked(await A.client.from("lt_blocks").delete().eq("member_id",B.id));
console.log("PASS: authenticated session remains valid during retry, but all guarded content and safety writes are rejected");
const preparedPost=ok(await admin.from("tortoise_posts").select().eq("id",post.id).single());
assert.equal(preparedPost.author_id,null);assert.equal(preparedPost.title,"탈퇴한 회원의 글");assert.equal(preparedPost.content,"작성자가 탈퇴하여 내용이 삭제되었습니다.");assert.deepEqual(preparedPost.image_paths,[]);
const preparedComments=ok(await admin.from("tortoise_comments").select().eq("post_id",post.id));
const preparedStub=preparedComments.find(c=>c.id===parent.id);assert.equal(preparedStub.author_id,null);assert.equal(preparedStub.nickname,"탈퇴한 회원");assert.equal(preparedStub.content,"탈퇴한 회원의 댓글입니다.");
assert.deepEqual(preparedComments.find(c=>c.id===reply.id),reply);
for(const table of ["tortoises","tortoise_growth_records"])assert.deepEqual(ok(await admin.from(table).select("id").eq("user_id",A.id)),[]);
assert.ok((await admin.storage.from(gallery).download(A.id+"/post.png")).data);
assert.ok((await admin.storage.from(diary).download(A.id+"/growth.png")).data);
assert.ok((await admin.auth.admin.deleteUser(A.id)).error);
ok(await admin.from("lt_test_storage_hold").insert({owner_id:A.id}));
await assert.rejects(processVerifiedWithdrawal(admin,A.id));
assert.ok(ok(await admin.storage.from(diary).download(A.id+"/growth.png")));
ok(await admin.from("lt_test_storage_hold").delete().eq("owner_id",A.id));
console.log("PASS: real Storage delete failure preserves object and account");
assert.equal(ok(await admin.auth.admin.getUserById(A.id)).user.id,A.id);
assert.equal(await processVerifiedWithdrawal(admin,A.id,1),false);
await assert.rejects(processVerifiedWithdrawal(admin,A.id));
assert.equal(ok(await admin.from("tortoise_posts").select("title").eq("id",post.id).single()).title,"탈퇴한 회원의 글");
assert.equal(ok(await admin.from("tortoise_comments").select("content").eq("id",reply.id).single()).content,"B reply");
ok(await admin.from("lt_test_hold").delete().eq("owner_id",A.id));
const endpoint="http://127.0.0.1:3218/api/account/withdrawal";
async function requestWithdrawal(client,memberId=A.id) {
  const headers={"Content-Type":"application/json"};
  if(client)headers.Authorization="Bearer "+ok(await client.auth.getSession()).session.access_token;
  return fetch(endpoint,{method:"POST",headers,body:JSON.stringify({member:memberId})});
}
assert.equal((await requestWithdrawal()).status,401);
const wrongMember=await requestWithdrawal(B.client);
assert.ok(!wrongMember.ok);
assert.equal(ok(await admin.auth.admin.getUserById(A.id)).user.id,A.id);
assert.equal(ok(await admin.auth.admin.getUserById(B.id)).user.id,B.id);
const completed=await requestWithdrawal(A.client);
assert.equal(completed.status,200);
assert.equal((await completed.json()).status,"complete");
console.log("PASS: Next.js route rejects anonymous and unrelated sessions and completes verified A request");
const deleted=await admin.auth.admin.getUserById(A.id);
assert.ok(deleted.error && (deleted.error.status===404 || deleted.error.code==="user_not_found"));
assert.equal(ok(await admin.auth.admin.getUserById(B.id)).user.id,B.id);
ok(await moderationAdmin.from("lt_withdrawals").insert({owner_id:adminUid}));
const adminWithdrawal=await requestWithdrawal(moderationAdmin,adminUid);
assert.equal(adminWithdrawal.status,200);
assert.equal((await adminWithdrawal.json()).status,"complete");
const deletedAdminAccount=await admin.auth.admin.getUserById(adminUid);
assert.ok(deletedAdminAccount.error && (deletedAdminAccount.error.status===404 || deletedAdminAccount.error.code==="user_not_found"));

const remaining=ok(await B.client.from("tortoise_posts").select().eq("id",post.id).single());
const bRemaining=ok(await B.client.from("tortoise_posts").select().eq("id",bPost.id).single());assert.equal(bRemaining.author_id,B.id);assert.equal(bRemaining.title,"B original");assert.equal(bRemaining.content,"B post remains");
assert.equal(remaining.author_id,null);assert.equal(remaining.title,"탈퇴한 회원의 글");assert.equal(remaining.content,"작성자가 탈퇴하여 내용이 삭제되었습니다.");assert.deepEqual(remaining.image_paths,[]);
const comments=ok(await B.client.from("tortoise_comments").select().eq("post_id",post.id));assert.deepEqual(comments.find(c=>c.id===reply.id),reply);
const stub=comments.find(c=>c.id===parent.id);assert.equal(stub.author_id,null);assert.equal(stub.nickname,"탈퇴한 회원");assert.equal(stub.content,"탈퇴한 회원의 댓글입니다.");
for(const table of ["tortoises","tortoise_growth_records"])assert.deepEqual(ok(await admin.from(table).select("id").eq("user_id",A.id)),[]);
for(const bucket of [gallery,diary])assert.deepEqual(ok(await admin.storage.from(bucket).list(A.id)),[]);
assert.ok((await admin.storage.from(gallery).download(B.id+"/keep.png")).data);
assert.ok((await admin.storage.from(gallery).download(A.id+"/post.png")).error);
assert.ok((await admin.storage.from(diary).download(A.id+"/growth.png")).error);
console.log("PASS: real Auth admin deletion, B reply and photo, tombstones, personal data cleanup, retry and upload guard.");
