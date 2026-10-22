import type { Metadata } from 'next';
import Header from '@/components/header';
import './globals.css';
export const metadata:Metadata={title:{default:'GAMELOG | 게임을 기록하는 공간',template:'%s | GAMELOG'},description:'PC, 콘솔, 모바일 게임을 탐색하고 게이머들의 평가를 살펴보는 리뷰 커뮤니티'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body><Header/>{children}<footer className="mt-24 border-t border-white/10 py-9"><div className="container-site flex flex-col justify-between gap-2 text-xs text-slate-500 sm:flex-row"><span>© 2026 GAMELOG · 데모 버전</span><span>표시된 평점과 리뷰는 샘플 데이터입니다.</span></div></footer></body></html>}
