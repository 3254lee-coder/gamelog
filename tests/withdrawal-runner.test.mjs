import assert from "node:assert/strict";
import { test } from "node:test";
import { processVerifiedWithdrawal } from "../lib/withdrawal-runner.mjs";

test("Storage failure leaves Auth intact; retry completes only after the inventory is empty", async () => {
  const member = "member";
  let paths = [{bucket:"tortoise-growth-photos",path:"member/photo"}];
  let fail = true;
  let deleted = false;
  const db = {
    rpc: async () => ({data:paths, error:null}),
    storage:{from:()=>({remove: async () => {
      if(fail) return {error:new Error("storage offline")};
      paths=[];return {error:null};
    }})},
    auth:{admin:{deleteUser:async(id)=>{assert.equal(id,member);assert.deepEqual(paths,[]);deleted=true;return {error:null}}}},
  };
  await assert.rejects(processVerifiedWithdrawal(db, member),/storage offline/);
  assert.equal(deleted,false);
  fail=false;
  assert.equal(await processVerifiedWithdrawal(db,member,1),false);
  assert.equal(deleted,false);
  assert.equal(await processVerifiedWithdrawal(db,member),true);
  assert.equal(deleted,true);
});
