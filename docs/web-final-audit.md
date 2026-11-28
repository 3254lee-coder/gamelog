# LIKE TURTLE 웹사이트 최종 개발·감독감찰 기록

- 기준일: 2026-11-28
- 저장소: [3254lee-coder/gamelog](https://github.com/3254lee-coder/gamelog)
- 개발 브랜치: `dev/web-readiness`
- 운영 홈페이지: https://like-turtle.vercel.app
- 시작 커밋: `d113556cf3319d903ebebd9e39683f45b3726118`
- 최신 검토 기준 HEAD: `497500d977e30f1ddc9b6a6b0762cf76f9f681c9`
- 최신 코드 CI 검증 커밋: `30b4af222baf5a9955607a52bcabe025f657b9f8`
- 최종 커밋: 이 보고서를 포함한 개발 브랜치 커밋(채팅 최종 결과에 SHA 기록)
- 운영 DB 변경, 실제 회원 삭제, `main` 병합, 운영 배포, 유료 서비스 변경은 실행하지 않았다.

## 기준선 및 실행 결과

작업 폴더는 시작 시 깨끗했고 원격 `dev/web-readiness` HEAD는 인수인계 기준 커밋 `d113556`과 일치했다. `AGENTS.md`, `docs/web-final-audit.md`, `migration_preflight` JSON은 저장소에 없었다. `supabase/inspect.sql`은 읽기 전용 구조 조회문이지만 아직 운영 결과가 없어 운영 스키마와 마이그레이션을 대조하지 않았다. 이전 게임 리뷰용 `supabase/schema.sql` 및 합성 테스트 스키마는 운영 기준선으로 취급하지 않았다.

| 검증 | 실제 실행 결과 |
|---|---|
| 설치 | `corepack pnpm install --frozen-lockfile --config.node-linker=hoisted` 성공, pnpm 11.25.0, lockfile 변경 없음 |
| 의존성 감사 | `corepack pnpm audit` 성공, 알려진 취약점 0건(감사 시점 기준) |
| 로컬 탈퇴 실행기 단위 테스트 | `node --test tests/withdrawal-runner.test.mjs` 통과 1, 실패 0 |
| 로컬 ESLint | 미실행 완료: 이 Windows 환경의 설치 패키지에서 `eslint/package.json`을 찾지 못해 중단. 동일 명령은 아래 CI에서 성공 |
| 로컬 PGlite 테스트 | 미실행 완료: 설치 패키지에서 `@electric-sql/pglite`를 찾지 못해 중단. CI의 격리 Supabase 테스트는 성공 |
| 라이브 사이트 읽기 전용 GET | `/`, `/guide`, `/community`, `/species`, `/growth`, `/login`, `/robots.txt`, `/sitemap.xml` 모두 HTTP 200 |
| 기준 CI | [GitHub Actions run 45919846552](https://github.com/3254lee-coder/gamelog/actions/runs/45919846552), `d113556` 대상 성공. 빌드·타입 검사·ESLint·격리 Supabase 및 브라우저 검증 단계 모두 성공 |
| 최신 CI | [GitHub Actions run 46107724755](https://github.com/3254lee-coder/gamelog/actions/runs/46107724755), `30b4af2` 대상 성공. `pnpm audit`, ESLint, Next.js build(타입 검사 포함), 격리 Supabase 및 브라우저 검증 단계 모두 성공 |

최신 CI 로그의 격리 데이터 검증 결과: 관리자 신고 검토/처리와 일반 회원 큐 접근 거부, 신고 제한·중복 신고·신고자 비공개·차단 격리, 게시글 수정/삭제, 좋아요, 검색·인기 정렬, 알림 read_at 권한, 성장 기록/사진 CRUD, 미준비 탈퇴 사진 조회·직접 Auth 삭제 거부, 동시 업로드 및 탈퇴 중 쓰기 차단, Storage 실패 후 계정 보존/재시도, 탈퇴 API 본인 인증, 타 회원 답글·사진 보존과 개인정보 정리, 모바일 회원가입·동의/프로필/관리자 화면, 데스크톱 비밀번호 복구/로그인이 통과했다. 실제 운영 계정이나 데이터를 쓰지 않았다.

## 1단계 — 운영 위험 제거

| 작업 ID | 기존 구현/신규 수정 | 검증 방법·환경 | 판정 | 증빙 경로·로그 | 잔존 위험·후속 조치 |
|---|---|---|---|---|---|
| P0-01 | 001~007 마이그레이션 순서·정적 구조를 검토했다. `docs/withdrawal.md`의 적용 순서와 사전 익명화/복구 설명을 갱신했다. | 최신 CI에서 합성 격리 스키마에 001~007 적용 성공. 운영 메타데이터는 미조회. | 미검증 | `supabase/migrations/001_moderation.sql`~`007_withdrawal_write_guard.sql`, `supabase/inspect.sql`, 최신 CI | `migration_preflight` JSON과 실제 운영 구조가 없다. 타입·기본값·NULL·FK/삭제 규칙·제약·인덱스·트리거·함수 소유권/search_path/권한·RLS·GRANT·Storage 정책을 운영 기준선과 대조해야 한다. 006/007의 호환성 및 기존 데이터 영향은 운영과 동등한 격리 스키마에서 확인 전이며, 운영 적합 판정은 하지 않았다. |
| P0-02 | 재인증, 사전 개인정보 정리 커밋, Storage 정리, Auth 삭제와 제한된 재시도 구현을 재사용했다. | 최신 격리 CI에서 사진 정리 전 개인정보 준비 요구, 준비 전 직접 Auth 삭제 거부, 처리 중 기존 세션 쓰기 차단, Storage 오류 후 재시도, 타 회원 답글/사진 보존을 통과. 로컬 실행기 단위 테스트 1건도 통과. 운영 탈퇴는 실행하지 않음. | 미검증 | `supabase/migrations/006_withdrawal_privacy_first.sql`, `007_withdrawal_write_guard.sql`, `lib/withdrawal-runner.mjs`, `tests/supabase/live.mjs`, 최신 CI | 운영 스키마 동등성은 P0-01 자료가 없어 검증되지 않았다. 개인정보 사전 정리는 커밋된 뒤 유지되며, 후속 Storage/Auth 실패 시 계정은 남고 사진은 일부 삭제될 수 있다. 현재 Storage 사진 백업은 없어 삭제된 사진 복구가 불가능하다. `WITHDRAWAL_PROCESSING_ENABLED`의 운영 값과 운영자 재개 절차는 승인 전에 확인해야 한다. |
| P0-03 | RLS/권한·Storage·API 경로와 서버 전용 service-role 사용을 검토했다. CI에 `pnpm audit` 단계를 추가했다. | `pnpm audit`: 알려진 취약점 0건. 현재 소스/해당 브랜치 이력의 클라이언트 service-role 노출 패턴 검색 결과 없음. 최신 CI에서 격리 관리자/회원 권한, 신고 비공개, 탈퇴 API 인증, Storage 및 탈퇴 중 쓰기 차단 시나리오 통과. | 미검증 | `.github/workflows/withdrawal-integration.yml`, `app/api/account/withdrawal/route.ts`, migrations 001~007, [최신 CI run](https://github.com/3254lee-coder/gamelog/actions/runs/46107724755) | 전체 비회원/회원 A·B/관리자 PostgREST·RPC·Storage 행렬, 비공개 서명 URL, 열별 권한 변조, CSRF/XSS/입력 제한, 최종 클라이언트 번들 비밀값 검사는 완결되지 않았다. |
| P0-04 | 기존 릴리스·탈퇴 문서의 중단 및 롤백 설명을 검토했다. | 문서 검토만 수행. DB/Auth/Storage 백업·격리 복원 시험은 실행하지 않음. | 미검증 | `docs/release.md`, `docs/withdrawal.md` | 현재 요금제의 백업 범위·보존/복구 시점·사진 파일 포함 여부와 비용을 확인하지 못했다. 합성 DB와 사진을 별도로 백업/복원하고 권한 및 파일 무결성을 검증해야 한다. RPO 24시간/RTO 4시간은 제안 목표이며 실측하지 않았다. |

## 2단계 — 웹사이트 안정화

| 작업 ID | 기존 구현/신규 수정 | 검증 방법·환경 | 판정 | 증빙 경로·로그 | 잔존 위험·후속 조치 |
|---|---|---|---|---|---|
| P1-01 | 기존 회귀 및 실브라우저 시나리오를 확장·재사용했다. | 최신 격리 CI에서 게시글 수정/삭제, 좋아요, 검색/정렬, 알림 권한, 성장/사진 CRUD, 관리자 신고 처리와 브라우저 가입/프로필/복구 검증 통과. 전체 R01~R12 행렬은 미완료. | 미검증 | `tests/supabase/live.mjs`, `tests/supabase/account-browser.mjs`, 최신 CI, 라이브 GET 기록 | 모바일 360/390/768 전체 및 실제 기기, 남은 게시글 5장·댓글 CRUD, 이메일 전달, SEO noindex/카카오, Analytics를 검증해야 한다. |
| P1-02 | 목록 RPC에서 차단 게시글을 서버에서 총건수/페이지 계산 전에 제외하고, 댓글·알림 필터와 페이지 갱신을 보완했다. | 최신 CI에서 차단 관계 격리, 검색/페이지 집계, 알림 필터 통과. | 부적합 | `supabase/migrations/007_withdrawal_write_guard.sql`, `app/community/page.tsx`, `components/community-comments.tsx`, `components/notifications.tsx`, 최신 CI | 정책의 차단 방향·적용 범위가 승인되지 않았다. 상세 페이지는 PostgREST로 게시글을 불러온 뒤 클라이언트에서 가리는 구조여서 차단된 글의 직접 API 접근 차단을 보장하지 않는다. 이 누락을 격리 환경에서 보완·검증하고 정책 승인 전 `NEXT_PUBLIC_MEMBER_SAFETY`를 운영 빌드에서 켜지 않아야 한다. 신고 10건도 잠정값이다. |
| P1-03 | 공개 개인정보/이용 문서와 기술 동작을 정적 검토했다. | 운영자 정책 승인 또는 법률 검토 결과 없음. | 미검증 | `app/privacy/page.tsx`, `app/terms/page.tsx`, `docs/withdrawal.md` | 신고·탈퇴 기록 보관 목적/기간, 백업에 남는 삭제 데이터, 처리 실패 안내와 문의 경로, 외부 서비스 사용을 정책 소유자가 결정해야 한다. 법률 적합성은 판정하지 않았다. |
| P1-04 | 기존 GitHub Actions를 유지하고 `pnpm audit`을 추가했다. | 최신 코드 커밋에서 lockfile 설치, `pnpm audit`, ESLint, Next.js build(타입 검사 포함), 격리 Supabase·브라우저 검증 모두 성공. | 적합 | `.github/workflows/withdrawal-integration.yml`, [최신 코드 CI run](https://github.com/3254lee-coder/gamelog/actions/runs/46107724755) | 운영 오류·사진 업로드 실패·미처리 신고 점검은 문서화된 비밀값 없는 운영 절차를 따른다. |

## 기존 기능 회귀 R01~R12

| 작업 ID | 검증 대상 | 판정 | 실제 증빙 및 남은 검증 |
|---|---|---|---|
| R01 | 홈·내비게이션·가이드 | 미검증 | 홈페이지와 `/guide` HTTP 200. 링크, 인기/최신 글 상호작용은 미검증. |
| R02 | 가입·로그인·로그아웃·복구 | 미검증 | 합성 계정으로 모바일 가입·동의, 로그인, 비밀번호 재설정 통과. 로그아웃과 실제 메일 전달/복구는 미검증. |
| R03 | 마이페이지 | 미검증 | 합성 계정 프로필 수정·저장 후 다시 불러오기 통과. 타 회원 접근 거부 전 범위는 미검증. |
| R04 | 게시글 | 미검증 | 합성 CI에서 소유권 있는 수정/삭제, 검색·인기 정렬, 페이지 집계 검증 통과. 5장 첨부·검색 경계와 모든 작성 흐름은 미검증. |
| R05 | 댓글·대댓글 | 미검증 | 탈퇴 시 타 회원 답글 보존 및 차단 댓글 필터 관련 격리 검증 통과. 일반 CRUD 전체 행렬은 미검증. |
| R06 | 좋아요·조회수 | 미검증 | 합성 CI에서 좋아요/취소 검증 통과. 조회수 집계·중복과 서버 제한은 미검증. |
| R07 | 알림 | 미검증 | 합성 CI에서 read_at 열 권한과 차단 댓글 알림 필터 통과. 수신 대상·갱신·나머지 열 변조는 미검증. |
| R08 | 성장일기 | 미검증 | 합성 CI에서 성장 기록과 사진 CRUD 통과. 그래프와 실제 Storage 정책/서명 URL 행렬은 미검증. |
| R09 | 관리자 | 미검증 | 합성 CI에서 관리자 신고 검토/처리, 회원 큐 접근 거부 및 모바일 대시보드 탐색 통과. 타인 게시글/댓글/사진 관리 전체는 미검증. |
| R10 | 신고·차단·탈퇴 | 미검증 | 합성 CI에서 신고 중복/제한/비공개, 차단 격리, 탈퇴 실패/재시도 통과. 정책과 직접 API 차단은 미확정/미검증. |
| R11 | 검색 노출·공유 | 미검증 | `/robots.txt`, `/sitemap.xml` HTTP 200. 익명화 noindex, 검색 색인과 카카오 공유는 미검증. |
| R12 | Analytics·메일 | 미검증 | 외부 Analytics 설정, 실제 테스트 메일 수신/복구는 미검증. |

## 운영 반영·승인 게이트

최종 판정은 **승인 보류**다. 이 판정은 개발 변경을 중단한다는 뜻이 아니라, 운영 반영 승인을 요청할 증거가 아직 부족하다는 뜻이다.

1. 운영자가 최신 구조 메타데이터 또는 `migration_preflight` JSON을 비밀값과 실제 행 데이터 없이 제공한다. 이를 기준으로 001~005 차이표, 재실행/중단 동작, 영향 잠금, 기존 데이터 제약을 검토한다.
2. 실제 서비스와 동등한 격리 프로젝트에서 전체 권한 행렬, 사진·탈퇴 실패/재개, 신고 동시성 및 서버 측 차단 범위를 검증한다. 운영 DB에는 SQL을 적용하지 않는다.
3. 운영자가 신고 제한, 차단 범위/방향, 익명화 자리표시자, 신고·처리 기록 보관기간, 문의/실패 안내를 결정한다. 미승인 상태에서는 `NEXT_PUBLIC_MEMBER_SAFETY`를 운영 빌드에 켜지 않는다.
4. 현재 Supabase 요금제의 DB/Auth/Storage 백업·복원 한계를 확인하고 합성 데이터로 복원 리허설을 수행한다. 비용이 드는 업그레이드는 별도 승인 전 제안만 한다.
5. 배포 승인 후에도 DB 마이그레이션과 웹 배포를 별도 승인·실행한다. 적용 전 백업, SQL 순서, 호환성, 중단 조건, Vercel 롤백과 DB/Storage 복구의 차이를 기록한다. 실제 회원 삭제 시험은 수행하지 않는다.

정책 보류 사항이 해소되고 필수 회귀 검증과 최종 커밋 CI가 통과한 뒤 감독감찰 재검수를 요청한다. 운영 배포 및 자동 탈퇴 활성화는 본 개발 완료와 별개 승인 게이트로 유지한다.
