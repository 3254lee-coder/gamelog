
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Eye,
  Heart,
  Leaf,
  Lightbulb,
  MessageCircle,
  MessagesSquare,
  PenLine,
  Search,
  Turtle,
  TrendingUp,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type Category = "free" | "tips" | "question";
type CategoryFilter = "all" | Category;
type SortOrder = "newest" | "oldest" | "popular" | "views";

type Post = {
  id: string;
  category: Category;
  title: string;
  content: string;
  author_id: string;
  image_paths: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
  like_count: number;
  comment_count: number;
  total_count: number;
};

const BUCKET = "tortoise-post-images";
const PAGE_SIZE = 10;

const categories = [
  {
    id: "free" as const,
    name: "자유게시판",
    description: "거북이 일상과 자유로운 이야기",
    icon: MessagesSquare,
    color: "#64866a",
    background: "#edf5e8",
  },
  {
    id: "tips" as const,
    name: "정보 및 TIP 공유하기",
    description: "사육 노하우와 유용한 정보",
    icon: Lightbulb,
    color: "#a18455",
    background: "#f8f0df",
  },
  {
    id: "question" as const,
    name: "질문",
    description: "궁금한 점을 함께 해결해요",
    icon: CircleHelp,
    color: "#6c8ca9",
    background: "#eaf1f8",
  },
];

function getCategory(value: string) {
  return categories.find(
    (category) => category.id === value
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatNumber(value: number) {
  return value.toLocaleString("ko-KR");
}

export default function CommunityPage() {
  const supabase = getSupabase();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] =
    useState<CategoryFilter>("all");

  const [query, setQuery] = useState("");
  const [sort, setSort] =
    useState<SortOrder>("newest");

  const [recentOnly, setRecentOnly] = useState(false);
  const [photosOnly, setPhotosOnly] = useState(false);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE)
  );

  useEffect(() => {
    if (!supabase) {
      setError("Supabase 연결 설정을 확인해 주세요.");
      setLoading(false);
      return;
    }

    let active = true;

    setLoading(true);
    setError("");

    // 검색어 입력 중 과도한 요청을 줄이기 위한 대기
    const timer = window.setTimeout(async () => {
      const { data, error: fetchError } =
        await supabase
          .rpc("browse_tortoise_posts", {
            p_category: category,
            p_query: query.trim(),
            p_sort: sort,
            p_page: page,
            p_page_size: PAGE_SIZE,
            p_recent_only: recentOnly,
            p_photos_only: photosOnly,
          });

      if (!active) return;

      if (fetchError) {
        console.error(
          "커뮤니티 목록 조회 실패:",
          fetchError.message
        );

        setError(
          "게시글을 불러오지 못했습니다. Supabase SQL 설정을 확인해 주세요."
        );

        setPosts([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      const loadedPosts: Post[] = (data ?? []).map(
        (item) => ({
          ...(item as Post),
          image_paths: item.image_paths ?? [],
          view_count: Number(item.view_count ?? 0),
          like_count: Number(item.like_count ?? 0),
          comment_count: Number(item.comment_count ?? 0),
          total_count: Number(item.total_count ?? 0),
        })
      );

      setPosts(loadedPosts);
      setTotalCount(
        loadedPosts.length > 0
          ? loadedPosts[0].total_count
          : 0
      );
      setLoading(false);
    }, query ? 300 : 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [
    supabase,
    category,
    query,
    sort,
    page,
    recentOnly,
    photosOnly,
  ]);

  function updateCategory(value: CategoryFilter) {
    setCategory(value);
    setPage(1);
  }

  function updateSort(value: SortOrder) {
    setSort(value);
    setPage(1);
  }

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateRecent(value: boolean) {
    setRecentOnly(value);
    setPage(1);
  }

  function updatePhotos(value: boolean) {
    setPhotosOnly(value);
    setPage(1);
  }

  function resetFilters() {
    setCategory("all");
    setQuery("");
    setSort("newest");
    setRecentOnly(false);
    setPhotosOnly(false);
    setPage(1);
  }

  function moveToPage(nextPage: number) {
    if (
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page
    ) {
      return;
    }

    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function getImageUrl(path: string) {
    if (!supabase) return "";

    return supabase.storage
      .from(BUCKET)
      .getPublicUrl(path).data.publicUrl;
  }

  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(
    totalPages,
    startPage + 4
  );
  const adjustedStartPage = Math.max(
    1,
    endPage - 4
  );

  const pageNumbers = Array.from(
    {
      length: endPage - adjustedStartPage + 1,
    },
    (_, index) => adjustedStartPage + index
  );

  const firstItem =
    totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(
    page * PAGE_SIZE,
    totalCount
  );

  const activeFilters =
    category !== "all" ||
    query.trim().length > 0 ||
    recentOnly ||
    photosOnly;

  return (
    <main className="container-site min-h-screen pb-24 pt-9 text-[#405a46]">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#62866a]"
      >
        <ArrowLeft size={17} />
        홈으로 돌아가기
      </Link>

      {/* 커뮤니티 상단 */}
      <section className="mt-7 rounded-[28px] bg-[#eaf2e4] px-7 py-12 md:px-12 md:py-16">
        <div className="flex items-center gap-2 text-[#62866a]">
          <Turtle size={24} />
          <span className="text-xs font-bold tracking-[0.18em]">
            TORTOISE COMMUNITY
          </span>
        </div>

        <h1 className="font-hand mt-5 text-4xl leading-tight md:text-6xl">
          우리들의 이야기
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-8 text-[#687c6b] md:text-base">
          거북이와 함께하는 소소한 일상부터
          <br />
          사육 노하우와 궁금한 이야기까지.
          <br />
          서로의 경험을 나누며 함께 성장하는 공간입니다.
        </p>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-[#62866a]">
          <MessageCircle size={16} />
          누구나 게시글을 읽을 수 있어요
        </div>
      </section>

      {/* 게시판 카테고리 */}
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {categories.map((item) => {
          const Icon = item.icon;
          const selected = category === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                updateCategory(
                  selected ? "all" : item.id
                )
              }
              aria-pressed={selected}
              className={`rounded-[22px] border p-6 text-left transition hover:-translate-y-1 hover:shadow-md ${
                selected
                  ? "border-[#83a78a] ring-2 ring-[#83a78a]/30"
                  : "border-white/80"
              }`}
              style={{
                backgroundColor: item.background,
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/75"
                style={{ color: item.color }}
              >
                <Icon size={26} strokeWidth={1.8} />
              </div>

              <h2 className="font-hand mt-5 text-2xl">
                {item.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#738573]">
                {item.description}
              </p>

              {selected && (
                <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-[#64866a]">
                  선택됨
                </span>
              )}
            </button>
          );
        })}
      </section>

      {/* 게시글 영역 */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold tracking-[0.16em] text-[#8ca18a]">
              COMMUNITY BOARD
            </p>
            <h2 className="font-hand text-3xl md:text-4xl">
              게시글
            </h2>
          </div>

          <Link
            href="/community/write"
            className="inline-flex items-center gap-2 rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#527558]"
          >
            <PenLine size={17} />
            글쓰기
          </Link>
        </div>

        {/* 검색 */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#dce7d8] bg-white px-4 py-3">
            <Search
              size={20}
              className="shrink-0 text-[#8aa58b]"
            />
            <input
              type="search"
              value={query}
              onChange={(event) =>
                updateQuery(event.target.value)
              }
              placeholder="게시글 제목 또는 내용을 검색하세요"
              aria-label="게시글 검색"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#9caa9b]"
            />
          </div>

          <select
            value={sort}
            onChange={(event) =>
              updateSort(
                event.target.value as SortOrder
              )
            }
            aria-label="게시글 정렬"
            className="rounded-2xl border border-[#dce7d8] bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="newest">최신순</option>
            <option value="popular">
              인기순 (좋아요 우선)
            </option>
            <option value="views">조회수순</option>
            <option value="oldest">오래된순</option>
          </select>
        </div>

        {/* 추가 필터 */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => updateRecent(!recentOnly)}
            aria-pressed={recentOnly}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
              recentOnly
                ? "border-[#668b6c] bg-[#668b6c] text-white"
                : "border-[#dce7d8] bg-white text-[#748975]"
            }`}
          >
            <TrendingUp size={15} />
            최근 7일
          </button>

          <button
            type="button"
            onClick={() => updatePhotos(!photosOnly)}
            aria-pressed={photosOnly}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
              photosOnly
                ? "border-[#668b6c] bg-[#668b6c] text-white"
                : "border-[#dce7d8] bg-white text-[#748975]"
            }`}
          >
            <Camera size={15} />
            사진 있는 글
          </button>

          {activeFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-[#64866a] underline underline-offset-4"
            >
              필터 초기화
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-[#849684]">
            {loading
              ? "게시글을 불러오는 중..."
              : `검색 결과 ${formatNumber(totalCount)}개`}
          </p>

          {!loading && !error && totalCount > 0 && (
            <p className="text-xs text-[#9aa99a]">
              {formatNumber(firstItem)}~
              {formatNumber(lastItem)}번째 표시
            </p>
          )}
        </div>

        {/* 게시글 목록 */}
        <div className="mt-5 overflow-hidden rounded-[24px] border border-[#e2e9dd] bg-white">
          {loading ? (
            <div
              role="status"
              className="px-6 py-16 text-center text-sm text-[#819482]"
            >
              게시글을 불러오는 중입니다...
            </div>
          ) : error ? (
            <div
              role="alert"
              className="px-6 py-16 text-center text-sm text-red-600"
            >
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <BookOpen
                size={35}
                className="mx-auto text-[#a2b6a1]"
              />

              <h3 className="font-hand mt-5 text-2xl">
                게시글이 없어요
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#849684]">
                검색 조건에 맞는 게시글이 없거나
                <br />
                아직 작성된 글이 없습니다.
              </p>

              {activeFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white"
                >
                  전체 게시글 보기
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#edf0e9]">
              {posts.map((post) => {
                const itemCategory = getCategory(
                  post.category
                );

                const thumbnail =
                  post.image_paths.length > 0
                    ? getImageUrl(post.image_paths[0])
                    : "";

                return (
                  <Link
                    key={post.id}
                    href={`/community/${post.id}`}
                    className="block px-5 py-5 transition hover:bg-[#f8faf6] md:px-7"
                  >
                    <div className="flex gap-4 md:gap-6">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#edf4e9] px-3 py-1 text-xs font-bold text-[#64866a]">
                            {itemCategory?.name ?? "게시글"}
                          </span>

                          <span className="text-xs text-[#9aa99a]">
                            {formatDate(post.created_at)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <h3 className="min-w-0 truncate text-base font-bold text-[#405a46] md:text-lg">
                            {post.title}
                          </h3>

                          {post.image_paths.length > 0 && (
                            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-[#719273]">
                              <Camera size={15} />
                              {post.image_paths.length}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-[#819282]">
                          {post.content}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#879989]">
                          <span className="inline-flex items-center gap-1 text-[#c48b91]">
                            <Heart size={15} />
                            {formatNumber(post.like_count)}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Eye size={15} />
                            {formatNumber(post.view_count)}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <MessageCircle size={15} />
                            {formatNumber(post.comment_count)}
                          </span>
                        </div>
                      </div>

                      {thumbnail ? (
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#e5ebdf] bg-[#f1f5ed] sm:h-28 sm:w-32">
                          <Image
                            src={thumbnail}
                            alt={`${post.title} 대표 사진`}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 96px, 128px"
                            className="object-cover transition duration-300 hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="hidden shrink-0 items-center justify-center text-[#9aaf9b] sm:flex">
                          <ArrowRight size={19} />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {!loading && !error && posts.length > 0 && totalPages > 1 && (
          <nav
            aria-label="게시글 페이지 이동"
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => moveToPage(page - 1)}
              disabled={page === 1}
              aria-label="이전 페이지"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce7d8] bg-white text-[#64866a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={19} />
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => moveToPage(pageNumber)}
                aria-current={
                  pageNumber === page ? "page" : undefined
                }
                className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-bold transition ${
                  pageNumber === page
                    ? "bg-[#668b6c] text-white"
                    : "border border-[#dce7d8] bg-white text-[#64866a] hover:bg-[#f1f6ed]"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={() => moveToPage(page + 1)}
              disabled={page === totalPages}
              aria-label="다음 페이지"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce7d8] bg-white text-[#64866a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={19} />
            </button>
          </nav>
        )}

        {!loading && !error && totalCount > 0 && (
          <p className="mt-4 text-center text-xs text-[#9aa99a]">
            {page} / {totalPages} 페이지
          </p>
        )}
      </section>

      {/* 하단 안내 */}
      <section className="mt-14 rounded-[24px] bg-[#f1f6ed] px-7 py-9">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#719273]">
            <Leaf size={25} />
          </div>

          <div>
            <h2 className="font-hand text-2xl">
              따뜻한 커뮤니티를 함께 만들어요
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#718573]">
              서로 다른 사육 경험을 존중하고,
              정확한 정보와 친절한 대화를 나눠주세요.
              건강이나 질병에 관한 내용은
              전문 수의사의 진료를 대신할 수 없습니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
