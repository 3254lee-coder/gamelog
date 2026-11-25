"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Eye,
  Heart,
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
  total_count: number;
};

type BrowsePostRow = {
  id: string;
  category: string;
  title: string;
  content: string;
  author_id: string;
  image_paths: string[] | null;
  view_count: number | null;
  created_at: string;
  updated_at: string;
  like_count: number | null;
  comment_count: number | null;
  total_count: number | null;
};

const ADMIN_UID = "5226f8c2-84ca-4189-b2a1-3a569bd3205c";
const BUCKET = "tortoise-post-images";
const PAGE_SIZE = 10;

const categories = [
  {
    id: "free" as const,
    name: "자유게시판",
    shortName: "자유",
    description: "거북이 일상과 자유로운 이야기",
    icon: MessagesSquare,
    color: "#64866a",
    background: "#edf5e8",
  },
  {
    id: "tips" as const,
    name: "정보 및 TIP 공유하기",
    shortName: "정보·TIP",
    description: "사육 노하우와 유용한 정보",
    icon: Lightbulb,
    color: "#a18455",
    background: "#f8f0df",
  },
  {
    id: "question" as const,
    name: "질문",
    shortName: "질문",
    description: "궁금한 점을 함께 해결해요",
    icon: CircleHelp,
    color: "#6c8ca9",
    background: "#eaf1f8",
  },
];

function getCategory(value: string) {
  return categories.find((item) => item.id === value);
