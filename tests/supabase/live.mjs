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
const parent=ok(await A.client.from("tortoise_comments").insert({author_id:A.id,post_id:post.id,nickname:"A",content:"parent"}).select().single());
const reply=ok(await B.client.from("tortoise_comments").insert({author_id:B.id,post_id:post.id,parent_id:parent.id,nickname:"B",content:"B reply"}).select().single());
const turtle=ok(await admin.from("tortoises").insert({user_id:A.id,name:"A turtle"}).select().single());
ok(await admin.from("tortoise_growth_records").insert({user_id:A.id,tortoise_id:turtle.id,memo:"A diary"}));
const submit=()=>A.client.from("lt_withdrawals").insert({owner_id:A.id});
ok(await submit());assert.equal((await submit()).error?.code,"23505");
ok(await admin.from("lt_test_hold").insert({owner_id:A.id}));
const [claim,race]=await Promise.all([admin.rpc("lt_withdrawal_photos",{member:A.id}),upload(A,gallery,"race.png")]);ok(claim);
const late=await upload(A,gallery,"late.png");assert.ok(late.error);
console.log("Concurrent upload:",race.error?"blocked":"committed before claim");
assert.ok((await admin.auth.admin.deleteUser(A.id)).error);
const failStorage={rpc:(...args)=>admin.rpc(...args),storage:{from:()=>({remove:async()=>({error:new Error("injected storage failure")})})},auth:admin.auth};
await assert.rejects(processVerifiedWithdrawal(failStorage,A.id),/injected storage failure/);
assert.equal(ok(await admin.auth.admin.getUserById(A.id)).user.id,A.id);
assert.equal(await processVerifiedWithdrawal(admin,A.id,1),false);
await assert.rejects(processVerifiedWithdrawal(admin,A.id));
assert.equal(ok(await admin.from("tortoise_posts").select("title").eq("id",post.id).single()).title,"A original");
ok(await admin.from("lt_test_hold").delete().eq("owner_id",A.id));
assert.equal(await processVerifiedWithdrawal(admin,A.id),true);
const deleted=await admin.auth.admin.getUserById(A.id);
assert.ok(deleted.error && (deleted.error.status===404 || deleted.error.code==="user_not_found"));
assert.equal(ok(await admin.auth.admin.getUserById(B.id)).user.id,B.id);
const remaining=ok(await B.client.from("tortoise_posts").select().eq("id",post.id).single());
assert.equal(remaining.author_id,null);assert.equal(remaining.title,"탈퇴한 회원의 글");assert.equal(remaining.content,"작성자가 탈퇴하여 내용이 삭제되었습니다.");assert.deepEqual(remaining.image_paths,[]);
const comments=ok(await B.client.from("tortoise_comments").select().eq("post_id",post.id));assert.deepEqual(comments.find(c=>c.id===reply.id),reply);
const stub=comments.find(c=>c.id===parent.id);assert.equal(stub.author_id,null);assert.equal(stub.nickname,"탈퇴한 회원");assert.equal(stub.content,"탈퇴한 회원의 댓글입니다.");
for(const table of ["tortoises","tortoise_growth_records"])assert.deepEqual(ok(await admin.from(table).select("id").eq("user_id",A.id)),[]);
for(const bucket of [gallery,diary])assert.deepEqual(ok(await admin.storage.from(bucket).list(A.id)),[]);
assert.ok((await admin.storage.from(gallery).download(B.id+"/keep.png")).data);
assert.ok((await admin.storage.from(gallery).download(A.id+"/post.png")).error);
assert.ok((await admin.storage.from(diary).download(A.id+"/growth.png")).error);
console.log("PASS: real Auth admin deletion, B reply and photo, tombstones, personal data cleanup, retry and upload guard.");
