
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ImagePlus,
  LockKeyhole,
  PenLine,
  Trash2,
  Turtle,
} from "lucide-react";

type Category = "free" | "tips" | "question";

type SelectedImage = {
  id: string;
  file: File;
  preview: string;
};

const BUCKET = "tortoise-post-images";
const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export default function CommunityWritePage() {
  const router = useRouter();
  const supabase = getSupabase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<SelectedImage[]>([]);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [category, setCategory] = useState<Category>("free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<SelectedImage[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      setError("Supabase 연결 설정을 확인해 주세요.");
      setLoading(false);
      return;
    }

    let active = true;

    async function checkLogin() {
      const { data } = await supabase!.auth.getUser();

      if (!active) return;

      setUser(data.user ?? null);
      setLoading(false);
    }

    checkLogin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) setUser(session?.user ?? null);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  function handleFiles(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!selected.length) return;

    setError("");

    if (images.length + selected.length > MAX_FILES) {
      setError(`사진은 최대 ${MAX_FILES}장까지 첨부할 수 있습니다.`);
      return;
    }

    for (const file of selected) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("JPG, PNG, WEBP 사진만 첨부할 수 있습니다.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("사진 1장의 크기는 5MB 이하여야 합니다.");
        return;
      }

      if (file.size === 0) {
        setError("비어 있는 파일은 첨부할 수 없습니다.");
        return;
      }
    }

    const nextImages = selected.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((previous) => [...previous, ...nextImages]);
  }

  function removeImage(id: string) {
    setImages((previous) => {
      const target = previous.find((image) => image.id === id);

      if (target) {
        URL.revokeObjectURL(target.preview);
      }

      return previous.filter((image) => image.id !== id);
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!supabase || saving) return;

    setError("");
    setStatus("");

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (cleanTitle.length < 2 || cleanTitle.length > 100) {
      setError("제목은 2~100자로 입력해 주세요.");
      return;
    }

    if (!cleanContent || cleanContent.length > 20000) {
      setError("본문은 1~20,000자로 입력해 주세요.");
      return;
    }

    setSaving(true);

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      setSaving(false);
      setUser(null);
      setError("로그인 후 게시글을 작성할 수 있습니다.");
      return;
    }

    const currentUser = authData.user;
    const uploadedPaths: string[] = [];

    try {
      // 사진을 먼저 업로드합니다.
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const extension = EXTENSIONS[image.file.type];

        const path =
          `${currentUser.id}/${crypto.randomUUID()}.${extension}`;

        setStatus(
          `사진 업로드 중... (${i + 1}/${images.length})`
        );

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, image.file, {
            contentType: image.file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `사진 업로드 실패: ${uploadError.message}`
          );
        }

        uploadedPaths.push(path);
      }

      setStatus("게시글 저장 중...");

      const { data, error: insertError } = await supabase
        .from("tortoise_posts")
        .insert({
          author_id: currentUser.id,
          category,
          title: cleanTitle,
          content: cleanContent,
          image_paths: uploadedPaths,
        })
        .select("id")
        .single();

      if (insertError || !data) {
        throw new Error(
          insertError?.message ?? "게시글 저장에 실패했습니다."
        );
      }

      router.push(`/community/${data.id}`);
      router.refresh();
    } catch (caught) {
      // 게시글 저장에 실패하면 이번에 올린 사진을 정리합니다.
      if (uploadedPaths.length) {
        const { error: cleanupError } =
          await supabase.storage
            .from(BUCKET)
            .remove(uploadedPaths);

        if (cleanupError) {
          console.error(
            "업로드 사진 정리 실패:",
            cleanupError.message
          );
        }
      }

      const message =
        caught instanceof Error
          ? caught.message
          : "게시글 등록 중 오류가 발생했습니다.";

      setError(message);
    } finally {
      setSaving(false);
      setStatus("");
    }
  }

  return (
    <main className="container-site min-h-screen min-w-0 pb-32 pt-5 text-[#405a46] sm:pb-24 sm:pt-9">
      <Link
        href="/community"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#62866a]"
      >
        <ArrowLeft size={17} />
        커뮤니티로 돌아가기
      </Link>

      <section className="mt-4 rounded-[22px] bg-[#eaf2e4] px-5 py-8 sm:mt-7 sm:rounded-[28px] sm:px-7 sm:py-10 md:px-12">
        <div className="flex items-center gap-2 text-[#62866a]">
          <Turtle size={24} />
          <span className="text-xs font-bold tracking-[0.18em]">
            WRITE YOUR STORY
          </span>
        </div>

        <h1 className="font-hand mt-4 text-3xl sm:mt-5 sm:text-4xl md:text-5xl">
          이야기 남기기
        </h1>

        <p className="mt-4 text-sm leading-7 text-[#687c6b]">
          거북이와 함께한 일상과 사진을 공유해 주세요.
        </p>
      </section>

      {loading ? (
        <div className="mt-6 rounded-3xl bg-white px-5 py-12 text-center sm:mt-8 sm:p-12">
          로그인 상태를 확인하는 중입니다...
        </div>
      ) : !user ? (
        <section className="mt-6 rounded-3xl bg-white px-5 py-12 text-center sm:mt-8 sm:px-7 sm:py-14">
          <LockKeyhole
            size={32}
            className="mx-auto text-[#668b6c]"
          />

          <h2 className="font-hand mt-5 text-3xl">
            글쓰기는 회원만 가능해요
          </h2>

          <p className="mt-4 text-sm text-[#718573]">
            로그인 후 게시글과 사진을 등록할 수 있습니다.
          </p>

          <Link
            href="/login"
            className="mt-7 inline-flex rounded-full bg-[#668b6c] px-7 py-3 text-sm font-bold text-white"
          >
            로그인하러 가기
          </Link>
        </section>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-6 min-w-0 space-y-6 rounded-[20px] border border-[#e3e9df] bg-white p-4 shadow-sm sm:mt-8 sm:space-y-7 sm:rounded-[24px] sm:p-6 md:p-9"
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
              disabled={saving}
              className="min-h-12 w-full rounded-xl border border-[#dce7d8] bg-white px-4 py-3 text-base sm:text-sm"
            >
              <option value="free">자유게시판</option>
              <option value="tips">정보 및 TIP 공유하기</option>
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
              disabled={saving}
              placeholder="제목을 입력해 주세요"
              className="min-h-12 w-full min-w-0 rounded-xl border border-[#dce7d8] px-4 py-3 text-base outline-none focus:border-[#8cad8c] sm:text-sm"
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
              onChange={(event) =>
                setContent(event.target.value)
              }
              maxLength={20000}
              rows={12}
              disabled={saving}
              placeholder="거북이와 함께한 이야기를 작성해 주세요."
              className="min-h-56 w-full min-w-0 resize-y rounded-xl border border-[#dce7d8] px-4 py-4 text-base leading-7 outline-none focus:border-[#8cad8c] sm:min-h-0 sm:text-sm"
              required
            />

            <p className="mt-2 text-right text-xs text-[#9baa99]">
              {content.length.toLocaleString()} / 20,000
            </p>
          </div>

          {/* 사진 첨부 */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-bold">
                사진 첨부
              </label>

              <span className="text-xs text-[#9baa99]">
                {images.length} / {MAX_FILES}장
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={saving}
              onChange={handleFiles}
              className="hidden"
              aria-label="게시글 사진 선택"
            />

            <button
              type="button"
              disabled={saving || images.length >= MAX_FILES}
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#cddfca] bg-[#f8fbf6] px-4 py-7 sm:px-5 sm:py-10 text-[#719273] transition hover:bg-[#f0f7ed] disabled:opacity-50"
            >
              <ImagePlus size={32} />

              <span className="mt-3 text-sm font-bold">
                사진 선택하기
              </span>

              <span className="mt-2 text-xs text-[#91a391]">
                JPG, PNG, WEBP · 1장당 5MB 이하
              </span>
            </button>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-2xl bg-[#eef3ea]"
                  >
                    <Image
                      src={image.preview}
                      alt={image.file.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => removeImage(image.id)}
                      aria-label={`${image.file.name} 제거`}
                      className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 p-2 text-red-500 shadow-sm disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {status && (
            <p
              role="status"
              className="rounded-xl bg-[#edf4e9] px-4 py-3 text-sm text-[#62866a]"
            >
              {status}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <Link
              href="/community"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#dce7d8] px-6 py-3 text-sm font-bold text-[#718573]"
            >
              취소
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#668b6c] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#527558] disabled:opacity-50"
            >
              <PenLine size={17} />
              {saving ? "등록 중..." : "게시글 등록"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
