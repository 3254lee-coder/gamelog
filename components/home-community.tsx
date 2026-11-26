
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Flame,
  MessageCircle,
  Heart,
  Eye,
  BookOpen,
} from "lucide-react";

import { getSupabase } from "@/lib/supabase";
import PostAuthor from "@/components/post-author";

type Post = {
  id: string;
  author_id: string;
  category: string;
  title: string;
  created_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
};

type HomePosts = {
  latest: Post[];
  popular: Post[];
};

type AuthorRow = {
  post_id: string;
  nickname: string;
};

const categoryNames: Record<string, string> = {
  free: "자유",
  tips: "정보·TIP",
  question: "질문",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "ko-KR",
    {
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Seoul",
    }
  );
}

export default function HomeCommunity() {
  const [posts, setPosts] = useState<HomePosts>({
    latest: [],
    popular: [],
  });

  const [authors, setAuthors] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const db = getSupabase();

    if (!db) {
      setLoading(false);
      setError("커뮤니티 연결을 확인해 주세요.");
      return;
    }

    let active = true;

    async function load() {
      try {
        const result = await db!.rpc(
          "get_tortoise_home_posts"
        );

        if (result.error) throw result.error;

        const data = result.data as HomePosts;

        const latest = data?.latest ?? [];
        const popular = data?.popular ?? [];

        const ids = Array.from(
          new Set(
            [...latest, ...popular].map(
              (post) => post.id
            )
          )
        );

        const authorMap: Record<string, string> = {};

        if (ids.length) {
          const result = await db!.rpc(
            "get_tortoise_post_authors",
            {
              p_post_ids: ids,
            }
          );

          if (result.error) {
            console.error(
              "작성자 조회 실패",
              result.error
            );
          } else {
            for (const row of (
              result.data ?? []
            ) as AuthorRow[]) {
              authorMap[row.post_id] = row.nickname;
            }
          }
        }

        if (!active) return;

        setPosts({
          latest,
          popular,
        });

        setAuthors(authorMap);
      } catch (caught) {
        console.error(
          "홈페이지 게시글 조회 실패",
          caught
        );

        if (active) {
          setError(
            "게시글을 불러오지 못했습니다."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  function renderPosts(
    items: Post[],
    popular = false
  ) {
    if (loading) {
      return (
        <p className="py-12 text-center text-sm text-[#829482]">
          이야기를 불러오는 중...
        </p>
      );
    }

    if (error) {
      return (
        <p className="py-10 text-center text-xs text-red-500">
          {error}
        </p>
      );
    }

    if (!items.length) {
      return (
        <div className="py-10 text-center">
          <BookOpen
            size={29}
            className="mx-auto text-[#a2b6a1]"
          />

          <p className="mt-4 text-sm text-[#829482]">
            {popular
              ? "최근 7일간 작성된 게시글이 없어요."
              : "아직 작성된 이야기가 없어요."}
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-[#edf0e9]">
        {items.map((post, index) => (
          <Link
            key={post.id}
            href={`/community/${post.id}`}
            className="group flex min-w-0 items-start gap-3 px-1 py-4 transition hover:bg-[#f7faf5] sm:px-2"
          >
            {popular && (
              <span className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                index === 0
                  ? "bg-[#f8efdf] text-[#b18a4c]"
                  : "bg-[#edf5e8] text-[#668b6c]"
              }`}>
                {index + 1}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#edf5e8] px-2 py-1 text-[10px] font-bold text-[#668b6c]">
                  {categoryNames[post.category] ??
                    "게시글"}
                </span>

                <span className="text-[10px] text-[#9baa99]">
                  {formatDate(post.created_at)}
                </span>
              </div>

              <h4 className="mt-2 line-clamp-2 break-words text-sm font-bold leading-6 text-[#405a46] transition group-hover:text-[#668b6c]">
                {post.title}
              </h4>

              <div className="mt-2">
                <PostAuthor
                  postId={post.id}
                  authorId={post.author_id}
                  nickname={
                    authors[post.id] || "회원"
                  }
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#829482]">
                <span className="inline-flex items-center gap-1 text-[#c48b91]">
                  <Heart size={13} />
                  {post.like_count}
                </span>

                <span className="inline-flex items-center gap-1">
                  <Eye size={13} />
                  {post.view_count}
                </span>

                <span className="inline-flex items-center gap-1">
                  <MessageCircle size={13} />
                  {post.comment_count}
                </span>
              </div>
            </div>

            <ArrowRight
              size={15}
              className="mt-3 shrink-0 text-[#a2b6a1] transition group-hover:translate-x-1"
            />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-6">
      <section className="min-w-0 rounded-[22px] border border-[#e7e5d9] bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f8efdf] text-[#c4975c]">
            <Flame size={24} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-widest text-[#b69a71]">
              POPULAR
            </p>

            <h3 className="font-hand mt-1 text-2xl">
              이번 주 인기 게시글
            </h3>
          </div>

          <span className="shrink-0 rounded-full bg-[#f8efdf] px-2.5 py-1 text-[10px] font-bold text-[#a18558]">
            TOP 5
          </span>
        </div>

        <p className="mt-4 text-[11px] leading-5 text-[#829482]">
          최근 7일 작성된 글 · 좋아요 및 조회수 기준
        </p>

        <div className="mt-3">
          {renderPosts(posts.popular, true)}
        </div>
      </section>

      <section className="min-w-0 rounded-[22px] border border-[#dce7d8] bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf5e8] text-[#668b6c]">
            <MessageCircle size={24} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-widest text-[#8ca18a]">
              LATEST
            </p>

            <h3 className="font-hand mt-1 text-2xl">
              최신 이야기
            </h3>
          </div>

          <Link
            href="/community"
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#668b6c]"
          >
            더보기
            <ArrowRight size={14} />
          </Link>
        </div>

        <p className="mt-4 text-[11px] leading-5 text-[#829482]">
          거북이 집사들의 새로운 이야기를 만나보세요.
        </p>

        <div className="mt-3">
          {renderPosts(posts.latest)}
        </div>
      </section>
    </div>
  );
}
