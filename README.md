# GAMELOG — 게임 리뷰 커뮤니티 MVP

Next.js App Router + React + Tailwind CSS 4 기반의 반응형 게임 리뷰 사이트입니다.

## 요구 사항
- Node.js 20.9 이상 (권장: Node.js 22 LTS)
- npm

## 실행
```bash
npm install
npm run dev
```
브라우저에서 http://localhost:3000 을 엽니다.

## 배포용 확인
```bash
npm run build
npm run start
```

## 구현 화면
- `/` : 메인 홈, 인기 게임, 게임 랭킹, 리뷰 샘플
- `/games` : 제목 검색, 플랫폼/장르 필터, 정렬
- `/games/[id]` : 게임 상세, 샘플 평점, 플랫폼

## 수정 위치
- `lib/games.ts`: 샘플 게임 및 리뷰 데이터
- `app/page.tsx`: 메인 페이지
- `components/game-browser.tsx`: 게임 탐색 인터랙션
- `app/globals.css`: 글로벌 스타일

## 주의 사항
- 현재 샘플 데이터로만 동작합니다. 로그인, 리뷰 저장, 신고, 관리자 기능은 미구현입니다.
- 표지 이미지 대신 추상 그래픽을 사용하여 외부 이미지 저작권 문제를 피했습니다.
- 실제 서비스 공개 전 개인정보 처리, 게임 데이터 라이선스, 인증/권한, 보안 및 콘텐츠 신고 체계를 구현해야 합니다.
