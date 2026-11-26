import { PGlite } from "@electric-sql/pglite";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const db = new PGlite();
const A = "11111111-1111-4111-8111-111111111111",
  B = "22222222-2222-4222-8222-222222222222";
await db.exec(`
create role authenticated;create role anon;create role service_role;create schema auth;create schema storage;
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
create function auth.jwt() returns jsonb language sql stable as $$select '{}'::jsonb$$;
create table auth.users(id uuid primary key);insert into auth.users values ('${A}'),('${B}');
create table storage.objects(bucket_id text,name text,owner_id text);
create table tortoise_posts(id int primary key,author_id uuid not null references auth.users,title text,content text,image_paths text[]);
create table tortoise_comments(id int primary key,post_id int references tortoise_posts on delete cascade,parent_id int references tortoise_comments on delete cascade,author_id uuid references auth.users,nickname text,content text);
create table tortoise_notifications(post_id int references tortoise_posts on delete cascade,post_title text);
create table tortoise_pinned_posts(post_id int references tortoise_posts on delete cascade);
create table tortoises(id int primary key,user_id uuid references auth.users on delete cascade);
create table tortoise_growth_records(id int primary key,tortoise_id int references tortoises on delete cascade);
create table tortoise_post_likes(post_id int references tortoise_posts on delete cascade,user_id uuid references auth.users on delete cascade);
insert into tortoise_posts values (1,'${A}','private title','private text','{pic}'),(2,'${A}','alone','alone','{}'),(3,'${B}','keep','keep','{}');
insert into tortoise_comments values(1,1,null,'${A}','old','old'),(2,1,1,'${B}','B','reply'),(3,1,null,'${A}','old','alone'),(4,3,null,'${A}','old','parent'),(5,3,4,'${B}','B','reply'),(6,2,null,'${A}','old','own');
insert into tortoise_notifications values(1,'private title');insert into tortoise_pinned_posts values(1);
insert into tortoises values (1,'${A}'),(2,'${B}');insert into tortoise_growth_records values(1,1),(2,2);
insert into tortoise_post_likes values (1,'${A}'),(1,'${B}');`);
for (const name of ["001_moderation", "004_withdrawal"])
  await db.exec(
    readFileSync(
      new URL("../supabase/migrations/" + name + ".sql", import.meta.url),
      "utf8",
    ),
  );
await assert.rejects(db.query("select * from lt_withdrawal_photos($1)", [A]));
await db.query("insert into lt_withdrawals(owner_id) values ($1)", [A]);
await db.query(
  "insert into storage.objects values('tortoise-growth-photos',$1,$2),('tortoise-growth-photos',$3,$4)",
  [A + "/old", A, B + "/keep", B],
);
await db.exec("set role authenticated");
await assert.rejects(
  db.query("select * from lt_withdrawal_photos($1)", [A]),
  (e) => e.code === "42501",
);
await db.exec("reset role");
await db.query("update storage.objects set owner_id=$1 where name=$2", [
  B,
  A + "/old",
]);
await assert.rejects(
  db.query("select * from lt_withdrawal_photos($1)", [A]),
  /ownership/,
);
await db.query("update storage.objects set owner_id=$1 where name=$2", [
  A,
  A + "/old",
]);
await db.exec("set role service_role");
assert.deepEqual(
  (await db.query("select * from lt_withdrawal_photos($1)", [A])).rows,
  [{ bucket: "tortoise-growth-photos", path: A + "/old" }],
);
await db.exec("reset role");
await assert.rejects(
  db.query("delete from auth.users where id=$1", [A]),
  /cleanup incomplete/,
);
await db.exec(`set test.uid='${A}'`);
await assert.rejects(
  db.query("insert into storage.objects values('tortoise-post-images',$1,$2)", [
    A + "/new",
    A,
  ]),
  /accepts uploads/,
);
await db.query("delete from storage.objects where owner_id=$1", [A]);
assert.equal(
  (await db.query("select * from lt_withdrawal_photos($1)", [A])).rows.length,
  0,
);
await db.exec(
  "create table simulated_dependency(owner_id uuid references auth.users)",
);
await db.query("insert into simulated_dependency values($1)", [A]);
await assert.rejects(
  db.query("delete from auth.users where id=$1", [A]),
  (e) => e.code === "23503",
);
assert.equal(
  (await db.query("select title from tortoise_posts where id=1")).rows[0].title,
  "private title",
);
await db.exec("delete from simulated_dependency");
await db.query("delete from auth.users where id=$1", [A]);
assert.deepEqual(
  (
    await db.query(
      "select id,author_id,title,image_paths from tortoise_posts order by id",
    )
  ).rows,
  [
    { id: 1, author_id: null, title: "탈퇴한 회원의 글", image_paths: [] },
    { id: 3, author_id: B, title: "keep", image_paths: [] },
  ],
);
assert.deepEqual(
  (
    await db.query(
      "select id,parent_id,author_id,content from tortoise_comments order by id",
    )
  ).rows.map((x) => [x.id, x.parent_id, x.author_id, x.content]),
  [
    [1, null, null, "탈퇴한 회원의 댓글입니다."],
    [2, 1, B, "reply"],
    [4, null, null, "탈퇴한 회원의 댓글입니다."],
    [5, 4, B, "reply"],
  ],
);
assert.equal(
  (await db.query("select post_title from tortoise_notifications")).rows[0]
    .post_title,
  "탈퇴한 회원의 글",
);
for (const table of ["lt_withdrawals", "tortoise_pinned_posts"])
  assert.equal((await db.query("select * from " + table)).rows.length, 0);
assert.equal(
  (await db.query("select user_id from tortoise_post_likes")).rows[0].user_id,
  B,
);
assert.equal(
  (await db.query("select id from tortoise_growth_records")).rows[0].id,
  2,
);
assert.equal(
  (await db.query("select owner_id from storage.objects")).rows[0].owner_id,
  B,
);
await db.close();
console.log(
  "PASS scope, conflicting ownership, interrupted cleanup, FK rollback/retry, anonymization, foreign replies, unrelated records",
);
