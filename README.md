# 거북이처럼 · LIKE TURTLE

Next.js App Router, TypeScript, Tailwind CSS와 Supabase를 사용하는 반려 거북이 커뮤니티입니다. 홈, 사육 가이드, 성장 기록, 커뮤니티, 알림, 회원 및 관리자 화면을 제공합니다.

## 로컬 개발

Node.js 22 LTS에서 의존성을 설치하고 dev 스크립트를 실행합니다. 테스트 환경의 NEXT_PUBLIC_SUPABASE_URL 및 NEXT_PUBLIC_SUPABASE_ANON_KEY를 로컬 환경 파일에 설정합니다. 브라우저에는 공개용 키만 사용합니다. 배포 전 lint, tsc --noEmit 및 build를 실행합니다.

## 데이터와 운영

supabase/schema.sql은 이전 게임 리뷰 기능의 기록입니다. 거북이 서비스를 이 파일로 초기화하지 마세요. supabase/inspect.sql은 운영자용 단일 메타데이터 조회입니다. 결과와 실제 RLS 조건·함수 구현을 비공개로 대조한 뒤 별도 테스트 프로젝트에서 회원 두 명과 비회원·관리자 역할로 검증합니다. 운영 회원 데이터는 복사하지 않습니다.

정책 문서의 신고 처리·차단 효과·보존기간·탈퇴 후 처리 기준은 운영자가 확정한 뒤 공개 문구에 반영합니다. 개발 브랜치 검증 후 승인된 커밋만 배포합니다. 장애 시 이전 Vercel 배포로 복원합니다. DB 마이그레이션은 웹 배포와 별도로 승인하고 사용자 생성 데이터는 롤백 시 보존합니다.
