
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pin, PinOff } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

const TABLE = "tortoise_pinned_posts";

type Notice = {
  id: string;
  title: string;
};

type PinRow = {
  post_id: string;
};

export function CommunityNotices() {
  const db = useMemo(() => getSupabase(), []);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!db) return;

    let active = true;

    async function load() {
      try {
        const pins = await db!
          .from(TABLE)
          .select("post_id")
          .order("pinned_at", { ascending: false })
          .order("post_id", { ascending: true });

        if (pins.error) throw pins.error;

        const ids = (
          (pins.data ?? []) as PinRow[]
        ).map((row) => row.post_id);

        if (!ids.length) return;

        const result = await db!
          .from("tortoise_posts")
          .select("id, title")
          .in("id", ids);

        if (result.error) throw result.error;

        const byId = new Map<string, Notice>(
          ((result.data ?? []) as Notice[]).map(
            (row) => [row.id, row]
          )
        );

        const ordered = ids
          .map((id) => byId.get(id))
          .filter(
            (row): row is Notice => row !== undefined
          );

        if (active) setNotices(ordered);
      } catch (e) {
        console.error("공지 조회 실패", e);

        if (active) setError(true);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [db]);

  if (error) {
    return (
      <p
        role="alert"
        className="mt-4 text-xs text-[#b56b6b]"
      >
        공지사항을 불러오지 못했습니다.
      </p>
    );
  }

  if (!notices.length) return null;

  return (
    <section
      aria-label="공지사항"
      className="mt-5 overflow-hidden rounded-2xl border border-[#dce7d8] bg-[#edf5e8]"
    >
      <h3 className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-[#527558]">
        <Pin size={17} />
        공지사항
      </h3>

      {notices.map((notice) => (
        <Link
          key={notice.id}
          href={`/community/${notice.id}`}
          className="flex min-h-12 items-center gap-3 border-t border-[#dce7d8] px-4 py-3 text-sm font-bold text-[#405a46] transition hover:bg-white/70"
        >
          <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] text-[#668b6c]">
            공지
          </span>

          <span className="min-w-0 break-words">
            {notice.title}
          </span>
        </Link>
      ))}
    </section>
  );
}

export function PostNoticeControl({
  postId,
  isAdmin,
  disabled = false,
}: {
  postId: string;
  isAdmin: boolean;
  disabled?: boolean;
}) {
  const db = useMemo(() => getSupabase(), []);

  const [pinned, setPinned] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db) return;

    let active = true;

    setReady(false);
    setError("");

    async function load() {
      try {
        const result = await db!
          .from(TABLE)
          .select("post_id")
          .eq("post_id", postId)
          .maybeSingle();

        if (result.error) throw result.error;

        if (active) {
          setPinned(!!result.data);
          setReady(true);
        }
      } catch (e) {
        console.error("공지 상태 조회 실패", e);

        if (active) {
          setError("공지 상태를 확인하지 못했습니다.");
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [db, postId]);

  async function toggle() {
    if (
      !db ||
      !isAdmin ||
      !ready ||
      busy ||
      disabled
    ) {
      return;
    }

    if (
      !window.confirm(
        pinned
          ? "공지 고정을 해제하시겠습니까?"
          : "이 게시글을 공지로 고정하시겠습니까?"
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const result = pinned
        ? await db
            .from(TABLE)
            .delete()
            .eq("post_id", postId)
            .select("post_id")
            .single()
        : await db
            .from(TABLE)
            .insert({ post_id: postId })
            .select("post_id")
            .single();

      if (result.error || !result.data) {
        throw result.error ??
          new Error("공지 상태 변경 실패");
      }

      setPinned(!pinned);
    } catch (e) {
      console.error("공지 변경 실패", e);

      setError(
        "공지 설정에 실패했습니다. 새로고침 후 다시 시도해 주세요."
      );
    } finally {
      setBusy(false);
    }
  }

  if (!isAdmin && (!ready || !pinned)) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {ready && pinned && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#e4efdf] px-3 py-2 text-xs font-bold text-[#527558]">
          <Pin size={14} />
          공지사항
        </span>
      )}

      {isAdmin && ready && (
        <button
          type="button"
          onClick={toggle}
          disabled={busy || disabled}
          aria-pressed={pinned}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#dce7d8] bg-white px-3 text-xs font-bold text-[#527558] disabled:opacity-50"
        >
          {pinned ? (
            <PinOff size={15} />
          ) : (
            <Pin size={15} />
          )}

          {busy
            ? "처리 중..."
            : pinned
              ? "공지 고정 해제"
              : "공지로 고정"}
        </button>
      )}

      {isAdmin && error && (
        <p
          role="alert"
          className="w-full text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
