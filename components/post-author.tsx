
"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

const ADMIN_UID =
  "5226f8c2-84ca-4189-b2a1-3a569bd3205c";

type AuthorRow = {
  post_id: string;
  nickname: string;
};

export default function PostAuthor({
  postId,
  authorId,
  nickname,
  showAdmin = true,
}: {
  postId: string;
  authorId?: string;
  nickname?: string;
  showAdmin?: boolean;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName("");

    if (nickname !== undefined) return;

    const db = getSupabase();

    if (!db || !postId) return;

    let active = true;

    async function load() {
      const { data, error } = await db!.rpc(
        "get_tortoise_post_authors",
        {
          p_post_ids: [postId],
        }
      );

      if (!active) return;

      if (error) {
        console.error("작성자 조회 실패", error);
        setName("회원");
        return;
      }

      const rows = (data ?? []) as AuthorRow[];

      setName(rows[0]?.nickname || "회원");
    }

    void load();

    return () => {
      active = false;
    };
  }, [postId, nickname]);

  const displayName =
    nickname ||
    name ||
    (
      authorId === ADMIN_UID
        ? "운영자"
        : "회원"
    );

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-[#718573] sm:text-xs">
      <UserRound
        size={13}
        className="shrink-0 text-[#88a58a]"
      />

      <span className="max-w-28 truncate font-semibold">
        {displayName}
      </span>

      {showAdmin && authorId === ADMIN_UID && (
        <span className="shrink-0 rounded-full bg-[#e4efdf] px-2 py-0.5 text-[10px] font-bold text-[#527558]">
          운영자
        </span>
      )}
    </span>
  );
}
