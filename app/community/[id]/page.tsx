"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  Heart,
  ImageIcon,
  ImagePlus,
  LockKeyhole,
  MessageCircle,
  Pencil,
  Send,
  Trash2,
  Turtle,
} from "lucide-react";

type Category = "free" | "tips" | "question";

type Post = {
  id: string;
  author_id: string;
  category: Category;
  title: string;
  content: string;
  image_paths: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
};

type Comment = {
  id: string;
  post_id: string;
  author_id: string | null;
  nickname: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type NewImage = {
  id: string;
  file: File;
  preview: string;
};

const ADMIN_UID = "5226f8c2-84ca-4189-b2a1-3a569bd3205c";
const BUCKET = "tortoise-post-images";
const MAX_IMAGES = 5;
const MAX_SIZE = 5 * 1024 * 1024;
const VIEW_INTERVAL = 30 * 60 * 1000;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const categoryNames: Record<Category, string> = {
  free: "자유게시판",
  tips: "정보 및 TIP 공유하기",
  question: "질문",
};

const postFields =
  "id, author_id, category, title, content, image_paths, view_count, created_at, updated_at";

const commentFields =
  "id, post_id, author_id, nickname, content, created_at, updated_at";

function formatDate(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNickname(user: User) {
  const metadata = user.user_metadata;
