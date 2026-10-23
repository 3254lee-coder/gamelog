
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Star,
  PenLine,
  Pencil,
  Trash2,
  Sparkles,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type Review = {
  id: string;
  user_id: string;
  score: number;
  title: string;
  body: string;
  created_at: string;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-[#dce3eb] bg-white p-3 text-sm text-[#384b61] outline-none transition focus:border-[#6686b5] focus:ring-2 focus:ring-[#6686b5]/15";

export default function ReviewSection({ gameId }: { gameId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [score, setScore] = useState("8.0");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  const db = getSupabase();

  const refresh = useCallback(async () => {
    if (!db) return;

    const { data, error } = await db
      .from("reviews")
      .select("id,user_id,score,title,body,created_at")
      .eq("game_id", gameId)
      .order("created_at", { ascending: false });

    if (error) setMessage(error.message);
    else setReviews(data ?? []);
  }, [db, gameId]);

  useEffect(() => {
    if (!db) return;

    db.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    void refresh();

    return () => subscription.unsubscribe();
  }, [db, refresh]);

  const mine = reviews.find((review) => review.user_id === userId);

  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.score, 0) /
      reviews.length
    : null;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!db || !userId) return;

    setBusy(true);
    setMessage("");

    const payload = {
      game_id: gameId,
      user_id: userId,
      score: Number(score),
      title: title.trim(),
      body: body.trim(),
    };

    const { error } = mine
      ? await db
          .from("reviews")
          .update(payload)
          .eq("id", mine.id)
          .eq("user_id", userId)
      : await db.from("reviews").insert(payload);

    if (error) {
      setMessage(error.message);
    } else {
      setEditing(false);
      setTitle("");
      setBody("");
      await refresh();
      setMessage("리뷰가 저장되었습니다.");
    }

    setBusy(false);
  }

  async function remove() {
    if (!db || !mine || !window.confirm("리뷰를 삭제할까요?")) {
      return;
    }

    setBusy(true);

    const { error } = await db
      .from("reviews")
      .delete()
      .eq("id", mine.id)
      .eq("user_id", userId);

    if (error) {
      setMessage(error.message);
    } else {
      await refresh();
      setEditing(false);
      setMessage("삭제했습니다.");
    }

    setBusy(false);
  }

  function edit() {
    if (!mine) return;

    setScore(String(mine.score));
    setTitle(mine.title);
    setBody(mine.body);
    setEditing(true);
  }

  return (
    <section className="mt-9 rounded-[28px] border border-[#e2e6eb] bg-white p-6 text-[#384b61] shadow-sm md:p-9">
      {/* 리뷰 제목과 통계 */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-[#6686b5]">
            <MessageCircle size={21} />
            <span className="text-xs font-bold tracking-[0.18em]">
              PLAYER REVIEWS
            </span>
          </div>

          <h2 className="font-hand mt-3 text-4xl md:text-5xl">
            플레이어들의 이야기
          </h2>

          <div className="mt-3 h-1.5 w-32 rotate-[-2deg] rounded-full bg-[#f2c86b]" />

          <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-[#66768b]">
            <span>실제 회원 리뷰 {reviews.length}개</span>
            <span className="text-[#cbd5e1]">·</span>
            <Star size={16} fill="currentColor" className="text-[#d9a43d]" />
            <span>
              평균{" "}
              <strong className="text-[#384b61]">
                {average === null
                  ? "평가 없음"
                  : `${average.toFixed(1)} / 10`}
              </strong>
            </span>
          </p>
        </div>

        {/* 리뷰 작성 / 수정 / 삭제 */}
        {userId && !mine && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#6686b5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#5575a4]"
          >
            <PenLine size={17} />
            리뷰 작성하기
          </button>
        )}

        {mine && !editing && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={edit}
              className="inline-flex items-center gap-2 rounded-full border border-[#d6e1ee] bg-[#eef3f9] px-4 py-2.5 text-sm font-semibold text-[#6686b5] transition hover:bg-[#e0eaf5]"
            >
              <Pencil size={15} />
              내 리뷰 수정
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={remove}
              className="inline-flex items-center gap-2 rounded-full border border-[#f1d6d6] bg-[#fff6f6] px-4 py-2.5 text-sm font-semibold text-[#bf6262] transition hover:bg-[#ffeded] disabled:opacity-50"
            >
              <Trash2 size={15} />
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 로그인 안내 */}
      {!db && (
        <p className="mt-7 rounded-xl bg-[#fff8e8] p-4 text-sm text-[#a77b32]">
          관리자가 Supabase 연결을 완료하면 리뷰 기능을 사용할 수 있습니다.
        </p>
      )}

      {db && !userId && (
        <div className="mt-7 rounded-2xl bg-[#eef3f9] p-5 text-sm text-[#66768b]">
          나만의 게임 이야기를 남기고 싶다면{" "}
          <Link
            href="/login"
            className="font-bold text-[#5575a4] underline underline-offset-4"
          >
            로그인
          </Link>
          해 주세요.
        </div>
      )}

      {/* 리뷰 작성 및 수정 폼 */}
      {editing && userId && (
        <form
          onSubmit={save}
          className="mt-8 space-y-5 rounded-2xl border border-[#dce5ef] bg-[#f3f6fa] p-5 md:p-7"
        >
          <div className="flex items-center gap-2">
            <PenLine size={20} className="text-[#6686b5]" />
            <h3 className="font-hand text-2xl">
              {mine ? "내 리뷰 고치기" : "나의 게임 이야기 남기기"}
            </h3>
          </div>

          <label className="block text-sm font-semibold">
            평점 (0.5점 단위)
            <select
              value={score}
              onChange={(event) => setScore(event.target.value)}
              className={fieldClass}
            >
              {Array.from(
                { length: 20 },
                (_, index) => (index + 1) / 2
              ).map((value) => (
                <option key={value} value={value}>
                  ★ {value.toFixed(1)} / 10
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold">
            제목
            <input
              required
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="이 게임을 한마디로 표현한다면?"
              className={fieldClass}
            />
          </label>

          <label className="block text-sm font-semibold">
            리뷰 내용
            <textarea
              required
              maxLength={5000}
              minLength={10}
              rows={5}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="기억에 남는 순간이나 솔직한 감상을 적어주세요."
              className={fieldClass}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-[#6686b5] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#5575a4] disabled:opacity-50"
            >
              {busy ? "저장 중..." : "리뷰 저장"}
            </button>

            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full border border-[#d6e1ee] bg-white px-6 py-3 text-sm font-semibold text-[#66768b]"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* 작업 결과 메시지 */}
      {message && (
        <p
          role="status"
          className="mt-5 rounded-xl bg-[#fff8e8] px-4 py-3 text-sm text-[#96712d]"
        >
          {message}
        </p>
      )}

      {/* 회원 리뷰 목록 */}
      <div className="mt-9 space-y-4">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-2xl border border-[#e2e6eb] bg-[#fbfcfe] p-5 transition hover:border-[#c8d7e8] md:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2">
                <Sparkles
                  size={18}
                  className="shrink-0 text-[#e7b94c]"
                />
                <h3 className="break-words text-base font-bold">
                  {review.title}
                </h3>
              </div>

              <span className="flex shrink-0 items-center gap-1 text-lg font-extrabold text-[#d9a43d]">
                <Star size={17} fill="currentColor" />
                {review.score.toFixed(1)}
              </span>
            </div>

            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-8 text-[#66768b]">
              {review.body}
            </p>

            <div className="mt-5 border-t border-[#edf0f3] pt-4 text-xs text-[#8995a5]">
              {new Date(review.created_at).toLocaleDateString("ko-KR")}
              {" · "}
              회원 {review.user_id.slice(0, 8)}
            </div>
          </article>
        ))}

        {db && reviews.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#d6e1ee] bg-[#f8fafc] px-5 py-14 text-center">
            <MessageCircle
              size={36}
              className="mx-auto text-[#a9bfd9]"
            />
            <p className="font-hand mt-4 text-2xl">
              아직 작성된 리뷰가 없어요!
            </p>
            <p className="mt-2 text-sm text-[#8995a5]">
              이 게임의 첫 번째 이야기를 남겨보세요.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
