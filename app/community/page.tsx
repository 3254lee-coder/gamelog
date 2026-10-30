
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CircleHelp,
  Eye,
  Heart,
  ImageIcon,
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
};

type PostCount = {
  post_id: string;
  like_count: number;
  comment_count: number;
};

const BUCKET = "tortoise-post-images";
const PAGE_SIZE = 200;

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

function getCategory(category: string) {
  return categories.find(
    (item) => item.id === category
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

  const [filter, setFilter] =
    useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] =
    useState<SortOrder>("newest");

  useEffect(() => {
    if (!supabase) {
      setError(
        "Supabase 연결 설정을 확인해 주세요."
      );
      setLoading(false);
      return;
    }

    let active = true;

    async function loadPosts() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } =
        await supabase!
          .from("tortoise_posts")
          .select(
            "id, category, title, content, author_id, image_paths, view_count, created_at, updated_at"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(PAGE_SIZE);

      if (!active) return;

      if (fetchError) {
        console.error(
          "게시글 조회 실패:",
          fetchError.message
        );

        setError(
          "게시글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
        );

        setPosts([]);
        setLoading(false);
        return;
      }

      const loadedPosts: Post[] =
        (data ?? []).map((item) => ({
          ...(item as Omit<
            Post,
            "like_count" | "comment_count"
          >),
          image_paths: item.image_paths ?? [],
          view_count: item.view_count ?? 0,
          like_count: 0,
          comment_count: 0,
        }));

      if (loadedPosts.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const postIds = loadedPosts.map(
        (post) => post.id
      );

      const { data: counts, error: countsError } =
        await supabase!.rpc(
          "get_tortoise_post_counts",
          {
            target_post_ids: postIds,
          }
        );

      if (!active) return;

      if (countsError) {
        console.error(
          "활동 지표 조회 실패:",
          countsError.message
        );

        setError(
          "좋아요·댓글 집계를 불러오지 못했습니다. SQL 설정을 확인해 주세요."
        );

        setPosts(loadedPosts);
        setLoading(false);
        return;
      }

      const countMap = new Map<
        string,
        PostCount
      >();

      ((counts ?? []) as PostCount[]).forEach(
        (item) => {
          countMap.set(item.post_id, item);
        }
      );

      const combinedPosts = loadedPosts.map(
        (post) => {
          const stats = countMap.get(post.id);

          return {
            ...post,
            like_count: Number(
              stats?.like_count ?? 0
            ),
            comment_count: Number(
              stats?.comment_count ?? 0
            ),
          };
        }
      );

      setPosts(combinedPosts);
      setLoading(false);
    }

    loadPosts();

    return () => {
      active = false;
    };
  }, [supabase]);

  const filteredPosts = useMemo(() => {
    const keyword = query
      .trim()
      .toLowerCase();

    return posts
      .filter((post) => {
        const categoryMatch =
          filter === "all" ||
          post.category === filter;

        const searchMatch =
          !keyword ||
          post.title
            .toLowerCase()
            .includes(keyword) ||
          post.content
            .toLowerCase()
            .includes(keyword);

        return categoryMatch && searchMatch;
      })
      .sort((a, b) => {
        const dateDiff =
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime();

        if (sort === "oldest") {
          return -dateDiff;
        }

        if (sort === "popular") {
          // 좋아요가 많은 순, 같으면 조회수 순
          const likeDiff =
            b.like_count - a.like_count;

          if (likeDiff !== 0) {
            return likeDiff;
          }

          const viewDiff =
            b.view_count - a.view_count;

          if (viewDiff !== 0) {
            return viewDiff;
          }

          return dateDiff;
        }

        if (sort === "views") {
          const viewDiff =
            b.view_count - a.view_count;

          return viewDiff !== 0
            ? viewDiff
            : dateDiff;
        }

        return dateDiff;
      });
  }, [posts, filter, query, sort]);

  const totalLikes = posts.reduce(
    (sum, post) => sum + post.like_count,
    0
  );

  const totalComments = posts.reduce(
    (sum, post) => sum + post.comment_count,
    0
  );

  function getImageUrl(path: string) {
    if (!supabase) return "";

    return supabase.storage
      .from(BUCKET)
      .getPublicUrl(path).data.publicUrl;
  }

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

      {/* 커뮤니티 활동 지표 */}
      <section className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[#e3e9df] bg-white px-3 py-5 text-center">
          <div className="flex items-center justify-center gap-2 text-[#719273]">
            <MessagesSquare size={18} />
            <span className="text-xs">게시글</span>
          </div>

          <p className="mt-2 text-xl font-bold md:text-2xl">
            {formatNumber(posts.length)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e3e9df] bg-white px-3 py-5 text-center">
          <div className="flex items-center justify-center gap-2 text-[#d58a91]">
            <Heart size={18} />
            <span className="text-xs">좋아요</span>
          </div>

          <p className="mt-2 text-xl font-bold md:text-2xl">
            {formatNumber(totalLikes)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e3e9df] bg-white px-3 py-5 text-center">
          <div className="flex items-center justify-center gap-2 text-[#7993b0]">
            <MessageCircle size={18} />
            <span className="text-xs">댓글</span>
          </div>

          <p className="mt-2 text-xl font-bold md:text-2xl">
            {formatNumber(totalComments)}
          </p>
        </div>
      </section>

      {/* 게시판 카테고리 */}
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const selected =
            filter === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                setFilter(
                  selected
                    ? "all"
                    : category.id
                )
              }
              aria-pressed={selected}
              className={`rounded-[22px] border p-6 text-left transition hover:-translate-y-1 hover:shadow-md ${
                selected
                  ? "border-[#83a78a] ring-2 ring-[#83a78a]/30"
                  : "border-white/80"
              }`}
              style={{
                backgroundColor:
                  category.background,
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/75"
                style={{
                  color: category.color,
                }}
              >
                <Icon
                  size={26}
                  strokeWidth={1.8}
                />
              </div>

              <h2 className="font-hand mt-5 text-2xl">
                {category.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#738573]">
                {category.description}
              </p>
            </button>
          );
        })}
      </section>

      {/* 게시글 목록 */}
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

        {/* 검색 및 정렬 */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#dce7d8] bg-white px-4 py-3">
            <Search
              size={20}
              className="text-[#8aa58b]"
            />

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="게시글 제목 또는 내용을 검색하세요"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#9caa9b]"
            />
          </div>

          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value as SortOrder
              )
            }
            aria-label="게시글 정렬"
            className="rounded-2xl border border-[#dce7d8] bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="newest">
              최신순
            </option>
            <option value="popular">
              인기순 (좋아요 우선)
            </option>
            <option value="views">
              조회수순
            </option>
            <option value="oldest">
              오래된순
            </option>
          </select>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-[#849684]">
            게시글 {filteredPosts.length}개
          </p>

          <div className="flex items-center gap-3">
            {sort === "popular" && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#668b6c]">
                <TrendingUp size={15} />
                인기순
              </span>
            )}

            {filter !== "all" && (
              <button
                type="button"
                onClick={() =>
                  setFilter("all")
                }
                className="text-xs font-bold text-[#64866a] underline underline-offset-4"
              >
                전체 게시글 보기
              </button>
            )}
          </div>
        </div>

        {/* 게시글 카드 */}
        <div className="mt-5 overflow-hidden rounded-[24px] border border-[#e2e9dd] bg-white">
          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-[#819482]">
              게시글을 불러오는 중입니다...
            </div>
          ) : error ? (
            <div
              role="alert"
              className="px-6 py-16 text-center text-sm text-red-600"
            >
              {error}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <BookOpen
                size={35}
                className="mx-auto text-[#a2b6a1]"
              />

              <h3 className="font-hand mt-5 text-2xl">
                게시글이 없어요
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#849684]">
                첫 번째 이야기를 기다리고 있어요.
                <br />
                거북이와 함께한 일상을 나눠주세요.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#edf0e9]">
              {filteredPosts.map((post) => {
                const category = getCategory(
                  post.category
                );

                const thumbnail =
                  post.image_paths.length > 0
                    ? getImageUrl(
                        post.image_paths[0]
                      )
                    : "";

                return (
                  <Link
                    key={post.id}
                    href={`/community/${post.id}`}
                    className="block px-5 py-5 transition hover:bg-[#f8faf6] md:px-7"
                  >
                    <div className="flex gap-4 md:gap-6">
                      {/* 게시글 텍스트 */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#edf4e9] px-3 py-1 text-xs font-bold text-[#64866a]">
                            {category?.name ??
                              "게시글"}
                          </span>

                          <span className="text-xs text-[#9aa99a]">
                            {formatDate(
                              post.created_at
                            )}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <h3 className="min-w-0 truncate text-base font-bold text-[#405a46] md:text-lg">
                            {post.title}
                          </h3>

                          {post.image_paths.length >
                            0 && (
                            <span
                              title={`첨부 사진 ${post.image_paths.length}장`}
                              className="inline-flex shrink-0 items-center gap-1 text-xs text-[#719273]"
                            >
                              <ImageIcon
                                size={15}
                              />
                              {
                                post.image_paths
                                  .length
                              }
                            </span>
                          )}
                        </div>

                        <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-[#819282]">
                          {post.content}
                        </p>

                        {/* 좋아요, 조회수, 댓글 수 */}
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#879989]">
                          <span className="inline-flex items-center gap-1 text-[#c48b91]">
                            <Heart size={15} />
                            {formatNumber(
                              post.like_count
                            )}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Eye size={15} />
                            {formatNumber(
                              post.view_count
                            )}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <MessageCircle
                              size={15}
                            />
                            {formatNumber(
                              post.comment_count
                            )}
                          </span>
                        </div>
                      </div>

                      {/* 첫 번째 사진 썸네일 */}
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
                          <ArrowRight
                            size={19}
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs leading-6 text-[#9aa99a]">
          현재 최신 게시글 최대 200개를 대상으로
          검색 및 정렬합니다.
          <br />
          전체 게시글 페이지네이션은 추후 추가할 예정입니다.
        </p>
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
