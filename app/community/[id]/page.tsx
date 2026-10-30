
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  CalendarDays,
  MessageCircle,
  Turtle,
} from "lucide-react";

type Post = {
  id: string;
  author_id: string;
  category: "free" | "tips" | "question";
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const categoryNames: Record<Post["category"], string> = {
  free: "자유게시판",
  tips: "정보 및 TIP 공유하기",
  question: "질문",
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommunityPostPage() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPost() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("tortoise_posts")
        .select(
          "id, author_id, category, title, content, created_at, updated_at"
        )
        .eq("id", postId)
        .maybeSingle();

      if (!active) return;

      if (fetchError) {
        setError("게시글을 불러오지 못했습니다.");
      } else if (!data) {
        setError("존재하지 않거나 삭제된 게시글입니다.");
      } else {
        setPost(data as Post);
      }

      setLoading(false);
    }

    if (postId) {
      loadPost();
    }

    return () => {
      active = false;
    };
  }, [postId]);

  return (
    <main className="container-site min-h-screen pb-24 pt-9 text-[#405a46]">
      <Link
        href="/community"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#62866a]"
      >
        <ArrowLeft size={17} />
        커뮤니티로 돌아가기
      </Link>

      {loading ? (
        <section className="mt-8 rounded-[24px] bg-white p-12 text-center">
          <p className="text-sm text-[#819482]">
            게시글을 불러오는 중입니다...
          </p>
        </section>
      ) : error || !post ? (
        <section className="mt-8 rounded-[24px] border border-[#e3e9df] bg-white px-7 py-16 text-center">
          <Turtle
            size={42}
            className="mx-auto text-[#9db69d]"
          />

          <h1 className="font-hand mt-5 text-3xl">
            게시글을 찾을 수 없어요
          </h1>

          <p role="alert" className="mt-4 text-sm text-[#819482]">
            {error}
          </p>

          <Link
            href="/community"
            className="mt-7 inline-flex rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white"
          >
            목록으로 돌아가기
          </Link>
        </section>
      ) : (
        <>
          <article className="mt-8 overflow-hidden rounded-[24px] border border-[#e3e9df] bg-white shadow-sm">
            <header className="border-b border-[#edf0e9] bg-[#f5f9f2] px-6 py-9 md:px-10">
              <span className="inline-flex rounded-full bg-[#e4efdf] px-4 py-2 text-xs font-bold text-[#62866a]">
                {categoryNames[post.category] ?? "게시글"}
              </span>

              <h1 className="font-hand mt-5 break-words text-3xl leading-snug md:text-4xl">
                {post.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[#829482]">
                <CalendarDays size={15} />
                <span>{formatDate(post.created_at)}</span>
              </div>
            </header>

            <div className="min-h-[250px] px-6 py-10 md:px-10">
              <div className="whitespace-pre-wrap break-words text-sm leading-8 text-[#526b56] md:text-base">
                {post.content}
              </div>
            </div>
          </article>

          <section className="mt-8 rounded-[24px] border border-[#e3e9df] bg-white px-6 py-9 md:px-10">
            <div className="flex items-center gap-2">
              <MessageCircle
                size={22}
                className="text-[#719273]"
              />
              <h2 className="font-hand text-2xl">
                댓글
              </h2>
            </div>

            <div className="mt-7 rounded-2xl bg-[#f7faf5] px-5 py-10 text-center">
              <p className="text-sm leading-7 text-[#819482]">
                댓글 기능을 준비하고 있어요.
                <br />
                회원 및 비회원 댓글 작성 기능이
                다음 단계에서 추가됩니다.
              </p>
            </div>
          </section>

          <div className="mt-8 flex justify-center">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 rounded-full bg-[#668b6c] px-7 py-3 text-sm font-bold text-white"
            >
              <ArrowLeft size={17} />
              게시글 목록
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
