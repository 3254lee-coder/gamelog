import type {Metadata} from 'next';
import GameBrowser from '@/components/game-browser';
export const metadata:Metadata={title:'게임 탐색'};
export default function GamesPage(){return <main className="container-site min-h-[70vh] pt-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-400">Explore games</p><h1 className="mt-2 text-3xl font-extrabold md:text-4xl">게임 탐색</h1><p className="mt-3 text-sm text-slate-400">플랫폼과 장르를 선택해 취향에 맞는 게임을 찾아보세요.</p><GameBrowser/></main>}
