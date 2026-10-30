
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  LockKeyhole,
  PenLine,
  Turtle,
} from "lucide-react";

type Category = "free" | "tips" | "question";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CommunityWritePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [category, setCategory] = useState<Category>("free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkLogin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      setUserId(user?.id ?? null);
      setLoading(false);
    }

    checkLogin();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!userId) {
      setError("로그인 후 글을 작성할 수 있습니다.");
      return;
    }

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (cleanTitle.length < 2 || cleanTitle.length > 100) {
      setError("제목은 2~100자로 입력해 주세요.");
      return;
    }

    if (
      cleanContent.length < 1 ||
      cleanContent.length > 20000
    ) {
      setError("본문은 1~20,000자로 입력해 주세요.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setSaving(false);
      setUserId(null);
      setError("로그인 상태를 확인할 수 없습니다. 다시 로그인해 주세요.");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("tortoise_posts")
      .insert({
        author_id: user.id,
        category,
        title: cleanTitle,
        content: cleanContent,
      })
      .select("id")
      .single();

    setSaving(false);

    if (insertError || !data) {
      setError(
        "게시글 저장에 실패했습니다. 잠시 후 다시 시도해 주세요."
      );
      return;
    }

    router.push(`/community/${data.id}`);
    router.refresh();
  }

  return (
    <main className="container-site min-h-screen pb-24 pt-9 text-[#405a46]">
      <Link
        href="/community"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#62866a]"
      >
        <ArrowLeft size={17} />
        커뮤니티로 돌아가기
      </Link>

      <section className="mt-7 rounded-[28px] bg-[#eaf2e4] px-7 py-10 md:px-12">
        <div className="flex items-center gap-2 text-[#62866a]">
          <Turtle size={24} />
          <span className="text-xs font-bold tracking-[0.18em]">
            WRITE YOUR STORY
          </span>
        </div>

        <h1 className="font-hand mt-5 text-4xl md:text-5xl">
          이야기 남기기
        </h1>

        <p className="mt-4 text-sm leading-7 text-[#687c6b]">
          거북이와 함께한 일상과 사육 경험을 나눠주세요.
        </p>
      </section>

      {loading ? (
        <div className="mt-8 rounded-[24px] border border-[#e3e9df] bg-white px-6 py-16 text-center">
          <p className="text-sm text-[#819482]">
            로그인 상태를 확인하고 있습니다...
          </p>
        </div>
      ) : !userId ? (
        <section className="mt-8 rounded-[24px] border border-[#e3e9df] bg-white px-7 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf4e9] text-[#668b6c]">
            <LockKeyhole size={30} />
          </div>

          <h2 className="font-hand mt-5 text-3xl">
            글쓰기는 회원만 가능해요
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#718573]">
            게시글과 댓글은 누구나 읽을 수 있지만,
            <br />
            새 게시글을 작성하려면 로그인이 필요합니다.
          </p>

          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#668b6c] px-7 py-3 text-sm font-bold text-white"
          >
            로그인하러 가기
          </Link>
        </section>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-7 rounded-[24px] border border-[#e3e9df] bg-white p-6 shadow-sm md:p-9"
        >
          <div>
            <label
              htmlFor="category"
              className="mb-3 block text-sm font-bold"
            >
              게시판 선택
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as Category)
              }
              className="w-full rounded-xl border border-[#dce7d8] bg-white px-4 py-3 text-sm outline-none focus:border-[#8cad8c]"
            >
              <option value="free">자유게시판</option>
              <option value="tips">
                정보 및 TIP 공유하기
              </option>
              <option value="question">질문</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="title"
              className="mb-3 block text-sm font-bold"
            >
              제목
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              placeholder="제목을 입력해 주세요"
              className="w-full rounded-xl border border-[#dce7d8] px-4 py-3 text-sm outline-none focus:border-[#8cad8c]"
              required
            />

            <p className="mt-2 text-right text-xs text-[#9baa99]">
              {title.length} / 100
            </p>
          </div>

          <div>
            <label
              htmlFor="content"
              className="mb-3 block text-sm font-bold"
            >
              내용
            </label>

            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={20000}
              rows={13}
              placeholder="거북이와 함께한 이야기를 자유롭게 작성해 주세요."
              className="w-full resize-y rounded-xl border border-[#dce7d8] px-4 py-4 text-sm leading-7 outline-none focus:border-[#8cad8c]"
              required
            />

            <p className="mt-2 text-right text-xs text-[#9baa99]">
              {content.length.toLocaleString()} / 20,000
            </p>
          </div>

          <div className="rounded-xl bg-[#f1f6ed] p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#62866a]">
              <BookOpen size={18} />
              게시글 작성 안내
            </div>

            <p className="mt-3 text-sm leading-7 text-[#718573]">
              서로를 존중하는 표현을 사용해 주세요.
              사육 정보는 가능한 한 경험과 근거를 구분해서
              작성해 주세요.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <Link
              href="/community"
              className="rounded-full border border-[#dce7d8] px-6 py-3 text-sm font-bold text-[#718573]"
            >
              취소
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#668b6c] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#527558] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                "저장 중..."
              ) : (
                <>
                  <PenLine size={17} />
                  게시글 등록
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
