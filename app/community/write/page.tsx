
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
