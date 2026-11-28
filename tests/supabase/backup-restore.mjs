import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const mode=process.argv[2];
const base=process.env.BACKUP_DIR;
assert.ok(base,"BACKUP_DIR is required");
const url=process.env.API_URL;
const key=process.env.SERVICE_ROLE_KEY;
const anon=process.env.ANON_KEY;
assert.ok(url&&key&&anon,"local Supabase API credentials are required");
assert.ok(["http://127.0.0.1:54321","http://localhost:54321"].includes(url),"only loopback Supabase is allowed");
const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const manifestPath=path.join(base,"synthetic-auth-storage.json");

if(mode==="export"){
  const email="restore-probe-"+randomUUID()+"@example.test";
  const password="Synthetic-"+randomUUID()+"-Aa!";
  const {data:created,error:createError}=await admin.auth.admin.createUser({
    email,password,email_confirm:true,user_metadata:{nickname:"복구리허설 합성회원"}
  });
  assert.ifError(createError);
  const bucket="backup-restore-probe";
  const {error:bucketError}=await admin.storage.createBucket(bucket,{public:false});
  assert.ifError(bucketError);
  const sourcePath=created.user.id+"/synthetic.txt";
  const bytes=Buffer.from("only synthetic recovery data","utf8");
  const {error:uploadError}=await admin.storage.from(bucket).upload(sourcePath,bytes,{contentType:"text/plain"});
  assert.ifError(uploadError);
  const {data:download,error:downloadError}=await admin.storage.from(bucket).download(sourcePath);
  assert.ifError(downloadError);
  assert.deepEqual(Buffer.from(await download.arrayBuffer()),bytes);
  await writeFile(manifestPath,JSON.stringify({
    email:created.user.email,
    email_confirmed:true,
    user_metadata:created.user.user_metadata,
    bucket,
    source_path:sourcePath,
    object_base64:bytes.toString("base64"),
    content_type:"text/plain"
  }),{mode:0o600});
  console.log("PASS: synthetic Auth metadata and private Storage object exported with local Supabase APIs");
}else if(mode==="restore"){
  const saved=JSON.parse(await readFile(manifestPath,"utf8"));
  const newPassword="Restore-only-"+randomUUID()+"-Aa!";
  const {data:restored,error:authError}=await admin.auth.admin.createUser({
    email:saved.email,password:newPassword,email_confirm:saved.email_confirmed,user_metadata:saved.user_metadata
  });
  assert.ifError(authError);
  assert.equal(restored.user.user_metadata.nickname,"복구리허설 합성회원");
  const {error:bucketError}=await admin.storage.createBucket(saved.bucket,{public:false});
  assert.ifError(bucketError);
  const restoredPath=restored.user.id+"/restored.txt";
  const bytes=Buffer.from(saved.object_base64,"base64");
  const {error:uploadError}=await admin.storage.from(saved.bucket).upload(restoredPath,bytes,{contentType:saved.content_type});
  assert.ifError(uploadError);
  const {data:download,error:downloadError}=await admin.storage.from(saved.bucket).download(restoredPath);
  assert.ifError(downloadError);
  assert.deepEqual(Buffer.from(await download.arrayBuffer()),bytes);
  const userClient=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:login,error:loginError}=await userClient.auth.signInWithPassword({email:saved.email,password:newPassword});
  assert.ifError(loginError);
  assert.equal(login.user.id,restored.user.id);
  assert.equal(login.user.user_metadata.nickname,saved.user_metadata.nickname);
  console.log("PASS: synthetic Auth account metadata and Storage bytes restored; account signs in with reset password");
}else{
  throw new Error("mode must be export or restore");
}
