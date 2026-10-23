# GAMELOG 2차 개발 배포 안내

## 포함된 기능
- 기존 홈/게임 목록/게임 상세 디자인 유지
- Supabase 이메일 회원가입 및 로그인/로그아웃
- 게임별 회원 1명당 리뷰 1개, 작성·수정·삭제
- 실제 등록된 리뷰의 평균 평점 및 개수 집계
- 마이페이지에서 내 리뷰 보기
- 기존 샘플 평점은 디자인 보존을 위해 유지하되 **샘플**로 명시

## 1. Supabase 프로젝트 생성
1. https://supabase.com/dashboard 에서 계정 생성 및 새 프로젝트 만들기
2. SQL Editor에서 `supabase/schema.sql` 전체 실행
3. Project Settings → API Keys에서 **publishable key** 또는 레거시 **anon key** 확인. `service_role`/secret 키는 절대 사용 금지
4. Project Settings → API에서 Project URL 확인
5. Authentication → URL Configuration에서 Site URL을 `https://gamelog-tau.vercel.app`로 설정하고 Redirect URLs에도 `https://gamelog-tau.vercel.app/**` 추가
6. Authentication → Providers → Email 설정 및 이메일 확인 정책 검토. 실제 운영 시 메일 발송 한도/SMTP 설정 필요

## 2. GitHub 업데이트
1. `https://github.com/3254lee-coder/gamelog` 접속
2. 기존 파일을 덮어쓰도록 **이 ZIP의 내부 파일과 폴더**를 저장소 루트에 업로드합니다. GitHub 웹 업로드에서 기존 파일 덮어쓰기가 막히면 GitHub Desktop 또는 git push 사용
3. `node_modules`, `.env.local`, 비밀키는 올리지 마세요.

## 3. Vercel 환경 변수
Vercel → gamelog 프로젝트 → Settings → Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase publishable/anon key
Production, Preview, Development 중 필요한 환경에 설정한 후 Redeploy

## 4. 검증
- 새 이메일 가입 → 메일 인증 → 로그인
- 게임 상세 페이지에서 리뷰 작성 → 평균 및 개수 변화 확인
- 리뷰 수정/삭제 및 마이페이지 확인
- 다른 계정에서 타인 리뷰 수정 불가 확인

## 주의
- 실제 배포와 SQL 실행은 사용자 계정 승인이 필요합니다.
- 이 ZIP의 코드는 Supabase 미설정 상태에서는 회원 기능이 작동하지 않습니다.
- 샘플 평점과 실제 리뷰 평균은 별도로 표시됩니다. 향후 통합 정리 필요.
- 운영 전 스팸 방지, 신고·차단, 개인정보 처리방침, 이메일 발송, 접근성, 모니터링 추가 권장.
