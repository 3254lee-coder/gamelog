import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { createClient } from "@supabase/supabase-js";

assert.ok(["http://127.0.0.1:54321", "http://localhost:54321"].includes(process.env.API_URL));
const { chromium } = createRequire(import.meta.url)(process.env.LT_BROWSER_MODULES + "/playwright-core");
const browser = await chromium.launch({channel:"chrome",headless:true});
const base="http://127.0.0.1:3218";
const email="browser-"+randomUUID()+"@example.test";
const password=randomUUID()+"Aa!";
const admin=createClient(process.env.API_URL,process.env.SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const mobile=await browser.newPage({viewport:{width:390,height:844}});
const desktop=await browser.newPage({viewport:{width:1366,height:850}});
try {
  await mobile.goto(base+"/login");
  await mobile.getByRole("button",{name:"회원가입하기"}).click();
  await mobile.getByPlaceholder("2~20자 닉네임").fill("가입검증");
  await mobile.locator('input[type=email]').fill(email);
  await mobile.locator('input[type=password]').fill(password);
  await mobile.getByText("전체 확인 및 동의").click();
  await mobile.locator('button[type=submit]').click();
  await mobile.waitForURL(base+"/my");
  await mobile.locator("input[autocomplete=nickname]").fill("변경검증");
  await mobile.getByRole("button",{name:"프로필 저장"}).click();
  await mobile.getByText("닉네임이 변경되었습니다.").waitFor();
  await mobile.reload();
  await mobile.getByRole("heading",{name:"변경검증",exact:true}).waitFor();
  assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));

  await mobile.goto(base+"/community");
  await mobile.getByRole("heading",{name:"우리들의 이야기"}).waitFor();
  await mobile.getByLabel("게시글 정렬").selectOption("oldest");
  await mobile.getByLabel("게시글 검색").fill("B original");
  await mobile.getByText("검색 결과 1개").waitFor();
  await mobile.getByRole("link",{name:/B original/}).first().click();
  await mobile.getByRole("heading",{name:"B original",exact:true}).waitFor();
  const likeButton=mobile.getByRole("button",{name:/^좋아요 [0-9,]+$/});
  await likeButton.click();
  await mobile.getByRole("button",{name:/^좋아요 취소/}).waitFor();
  await mobile.getByRole("button",{name:/^좋아요 취소/}).click();
  await mobile.getByPlaceholder("따뜻한 댓글을 남겨주세요.").fill("모바일 댓글 회귀 검증");
  await mobile.getByRole("button",{name:"댓글 등록"}).click();
  await mobile.getByText("모바일 댓글 회귀 검증",{exact:true}).waitFor();
  await mobile.getByRole("button",{name:"답글 달기"}).click();
  await mobile.getByPlaceholder("따뜻한 답글을 남겨주세요.").fill("모바일 답글 회귀 검증");
  await mobile.getByRole("button",{name:"답글 등록"}).click();
  await mobile.getByText("모바일 답글 회귀 검증",{exact:true}).waitFor();
  assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await mobile.goto(base+"/growth");
  await mobile.getByRole("heading",{name:/성장/}).first().waitFor();
  assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));


  for (const route of ["/guide","/species"]) {
    await mobile.goto(base+route);
    await mobile.locator("h1").first().waitFor();
    assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }

  await mobile.goto(base+"/admin");
  await mobile.getByText("접근 권한이 없습니다").waitFor();
  const recovery=await admin.auth.admin.generateLink({type:"recovery",email});
  if(recovery.error) throw recovery.error;
  // Use the locally generated recovery token; external email delivery is out of scope.
  await desktop.goto(base+"/reset-password?type=recovery&token_hash="+recovery.data.properties.hashed_token);
  const updated=randomUUID()+"Aa!";
  const inputs=desktop.locator("input[type=password]");
  await inputs.nth(0).fill(updated);
  await inputs.nth(1).fill(updated);
  await desktop.locator("button[type=submit]").click();
  await desktop.getByText("비밀번호가 변경되었습니다.",{exact:true}).waitFor();
  await desktop.goto(base+"/login");
  await desktop.locator("input[type=email]").fill(email);
  await desktop.locator("input[type=password]").fill(updated);
  await desktop.locator("button[type=submit]").click();
  await desktop.waitForURL(base+"/my");
  await desktop.getByRole("heading",{name:"변경검증",exact:true}).waitFor();
  assert.ok(await desktop.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  console.log("PASS: mobile signup and consent, profile edit and persistence, ordinary member admin denial, desktop password reset and login");
} finally {await browser.close();}
