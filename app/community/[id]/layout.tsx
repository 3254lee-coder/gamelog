import type { Metadata } from "next";
import type { ReactNode } from "react";

type Props = { params: Promise<{ id: string }> };
const unavailable: Metadata = { title: "커뮤니티 게시글", robots: { index: false, follow: false } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key || !/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(id)) return unavailable;

  try {
    // Use anonymous access only, including when the visitor has a session.
    const url = new URL("/rest/v1/tortoise_posts", base);
    url.search = new URLSearchParams({ id: "eq." + id, select: "title,author_id", limit: "1" }).toString();
    const response = await fetch(url, { headers: { apikey: key }, cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (!response.ok) return unavailable;
    const [post] = await response.json();
    if (!post?.author_id || typeof post.title !== "string" || !post.title.trim()) return unavailable;
    const title = post.title.trim();
    const path = "/community/" + id;
    const description = "거북이처럼 커뮤니티에서 이야기를 읽고 의견을 나누세요.";
    return {
      title, description, alternates: { canonical: path },
      openGraph: { type: "article", locale: "ko_KR", siteName: "LIKE TURTLE", title, description, url: path, images: ["/tortoise-hero.png"] },
      twitter: { card: "summary_large_image", title, description, images: ["/tortoise-hero.png"] },
    };
  } catch {
    return unavailable;
  }
}

export default function PostLayout({ children }: { children: ReactNode }) {
  return children;
}
