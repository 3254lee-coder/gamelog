export type Platform = 'PC' | 'PlayStation' | 'Xbox' | 'Switch' | 'Mobile';
export type Game = { id:string; title:string; englishTitle:string; genre:string; platforms:Platform[]; year:number; rating:number; reviews:number; accent:string; icon:string; image?:string; description:string; featured?:boolean };
export const games: Game[] = [
{id:'elden-ring',title:'엘든 링',englishTitle:'ELDEN RING',genre:'액션 RPG',platforms:['PC','PlayStation','Xbox'],year:2022,rating:9.4,reviews:2341,accent:'#8e7656',icon:'⚔',image:'/games/elden-ring.jpg',description:'광활한 판타지 세계를 탐험하는 오픈월드 액션 RPG.',featured:true},
{id:'baldurs-gate-3',title:'발더스 게이트 3',englishTitle:'BALDUR’S GATE 3',genre:'RPG',platforms:['PC','PlayStation','Xbox'],year:2023,rating:9.6,reviews:1984,accent:'#755ba2',icon:'✦',image:'/games/baldurs-gate-3.jpg',description:'선택과 결과가 이야기를 바꾸는 깊이 있는 턴제 RPG.'},
{id:'zelda-totk',title:'젤다의 전설: 티어스 오브 더 킹덤',englishTitle:'TEARS OF THE KINGDOM',genre:'어드벤처',platforms:['Switch'],year:2023,rating:9.3,reviews:1750,accent:'#5b9180',icon:'◇',image:'/games/zelda-totk.jpg',description:'하늘과 지상을 자유롭게 누비는 모험.'},
{id:'stardew-valley',title:'스타듀 밸리',englishTitle:'STARDEW VALLEY',genre:'시뮬레이션',platforms:['PC','PlayStation','Xbox','Switch','Mobile'],year:2016,rating:9.2,reviews:3210,accent:'#bd8a55',icon:'❀',image:'/games/stardew-valley.jpg',description:'농장을 가꾸고 마을 사람들과 관계를 맺는 힐링 게임.'},
{id:'hades',title:'하데스',englishTitle:'HADES',genre:'로그라이크',platforms:['PC','PlayStation','Xbox','Switch','Mobile'],year:2020,rating:9.1,reviews:1220,accent:'#b45b5b',icon:'♜',image:'/games/hades.jpg',description:'매번 달라지는 탈출 시도가 매력적인 액션 로그라이크.'},
{id:'hollow-knight',title:'할로우 나이트',englishTitle:'HOLLOW KNIGHT',genre:'메트로배니아',platforms:['PC','PlayStation','Xbox','Switch'],year:2017,rating:9.0,reviews:1604,accent:'#657c9a',icon:'☾',image:'/games/hollow-knight.jpg',description:'아름답고 쓸쓸한 지하 왕국을 탐험하는 액션 게임.'},
{id:'cyberpunk-2077',title:'사이버펑크 2077',englishTitle:'CYBERPUNK 2077',genre:'액션 RPG',platforms:['PC','PlayStation','Xbox','Switch'],year:2020,rating:8.8,reviews:2130,accent:'#b7a74b',icon:'⌁',image:'/games/cyberpunk-2077.jpg',description:'미래 도시 나이트 시티에서 펼쳐지는 이야기.'},
{id:'minecraft',title:'마인크래프트',englishTitle:'MINECRAFT',genre:'샌드박스',platforms:['PC','PlayStation','Xbox','Switch','Mobile'],year:2011,rating:9.0,reviews:4280,accent:'#659267',icon:'▦',image:'/games/minecraft.jpg',description:'상상하는 세계를 직접 만들고 탐험하는 샌드박스 게임.'},
{
  id: "pokemon-pokopia",
  title: "포켓몬 포코피아",
  englishTitle: "POKÉMON POKOPIA",
  genre: "생활 시뮬레이션",
  platforms: ["Switch"],
  year: 2026,
  rating: 0,
  reviews: 0,
  accent: "#9bcaa5",
  icon: "🌱",
  image: "/games/pokemon-pokopia.jpg",
  description: "포켓몬들과 함께 마을을 만들고 꾸미는 슬로 라이프 게임."
},
{
  id: "modern-warfare-4",
  title: "콜 오브 듀티: 모던 워페어 4",
  englishTitle: "CALL OF DUTY: MODERN WARFARE 4",
  genre: "FPS",
  platforms: ["PC", "PlayStation", "Xbox", "Switch"],
  year: 2026,
  rating: 0,
  reviews: 0,
  accent: "#788b78",
  icon: "🎯",
  image: "/games/modern-warfare-4.jpg",
  description: "캠페인과 멀티플레이, DMZ를 즐기는 밀리터리 FPS."
},
{
  id: "league-of-legends",
  title: "리그 오브 레전드",
  englishTitle: "LEAGUE OF LEGENDS",
  genre: "MOBA",
  platforms: ["PC"],
  year: 2009,
  rating: 0,
  reviews: 0,
  accent: "#7ba5bc",
  icon: "⚔️",
  image: "/games/league-of-legends.jpg",
  description: "다섯 명의 팀원이 전략과 협동으로 승리를 겨루는 게임."
},
{
  id: "fc-online",
  title: "FC 온라인",
  englishTitle: "FC ONLINE",
  genre: "스포츠",
  platforms: ["PC", "Mobile"],
  year: 2018,
  rating: 0,
  reviews: 0,
  accent: "#85b99b",
  icon: "⚽",
  image: "/games/fc-online.jpg",
  description: "선수와 팀을 구성해 축구 경기를 즐기는 온라인 게임."
},
{
  id: "overwatch-2",
  title: "오버워치",
  englishTitle: "OVERWATCH",
  genre: "팀 기반 FPS",
  platforms: ["PC", "PlayStation", "Xbox", "Switch"],
  year: 2022,
  rating: 0,
  reviews: 0,
  accent: "#e9ad70",
  icon: "☀️",
  image: "/games/overwatch-2.jpg",
  description: "개성 있는 영웅을 선택해 팀원들과 협력하는 슈팅 게임."
},
{
  id: "pubg",
  title: "배틀그라운드",
  englishTitle: "PUBG: BATTLEGROUNDS",
  genre: "배틀로얄",
  platforms: ["PC", "PlayStation", "Xbox"],
  year: 2017,
  rating: 0,
  reviews: 0,
  accent: "#c6ae77",
  icon: "🪖",
  image: "/games/pubg.jpg",
  description: "생존을 위해 장비를 수집하고 마지막까지 경쟁하는 게임."
},
{
  id: "valorant",
  title: "발로란트",
  englishTitle: "VALORANT",
  genre: "전술 FPS",
  platforms: ["PC", "PlayStation", "Xbox"],
  year: 2020,
  rating: 0,
  reviews: 0,
  accent: "#e28e94",
  icon: "✦",
  image: "/games/valorant.jpg",
  description: "요원들의 능력과 정밀한 사격을 결합한 팀 기반 전술 FPS."
}

];
export const recentReviews = [
{user:'pixel_park',game:'발더스 게이트 3',score:9.5,text:'선택 하나하나가 모험을 완전히 다르게 만듭니다.',time:'2시간 전'},
{user:'moonlight',game:'스타듀 밸리',score:9.0,text:'조용히 즐기다 보면 어느새 시간이 사라져요.',time:'5시간 전'},
{user:'archer77',game:'엘든 링',score:9.5,text:'탐험의 즐거움을 다시 느끼게 해준 작품.',time:'어제'}
];
