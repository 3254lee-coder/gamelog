
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

  const value =
    metadata?.nickname ||
    metadata?.display_name ||
    metadata?.name ||
    user.email?.split("@")[0] ||
    "회원";

  return String(value).trim().slice(0, 20) || "회원";
}

export default function CommunityPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const supabase = getSupabase();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newImagesRef = useRef<NewImage[]>([]);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [liking, setLiking] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [status, setStatus] = useState("");

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [editingPost, setEditingPost] = useState(false);
  const [postCategory, setPostCategory] =
    useState<Category>("free");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

  const [keptImages, setKeptImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);

  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] =
    useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] =
    useState("");

  useEffect(() => {
    newImagesRef.current = newImages;
  }, [newImages]);

  useEffect(() => {
    return () => {
      newImagesRef.current.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });
    };
  }, []);

  useEffect(() => {
    if (!supabase || !postId) {
      setError("Supabase 연결 설정을 확인해 주세요.");
      setLoading(false);
      return;
    }

    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");

      const [postResult, commentResult, authResult] =
        await Promise.all([
          supabase!
            .from("tortoise_posts")
            .select(postFields)
            .eq("id", postId)
            .maybeSingle(),

          supabase!
            .from("tortoise_comments")
            .select(commentFields)
            .eq("post_id", postId)
            .order("created_at", { ascending: true }),

          supabase!.auth.getUser(),
        ]);

      if (!active) return;

      if (postResult.error) {
        setError(
          "게시글을 불러오지 못했습니다. SQL 설정을 확인해 주세요."
        );
      } else if (!postResult.data) {
        setError("존재하지 않거나 삭제된 게시글입니다.");
      } else {
        const loaded = postResult.data as Post;

        setPost({
          ...loaded,
          image_paths: loaded.image_paths ?? [],
          view_count: loaded.view_count ?? 0,
        });

        setPostCategory(loaded.category);
        setPostTitle(loaded.title);
        setPostContent(loaded.content);
        setKeptImages(loaded.image_paths ?? []);

        // 같은 브라우저에서 30분 이내 중복 조회 감소
        const viewKey = `tortoise_view_${postId}`;
        const now = Date.now();

        let shouldCount = true;

        try {
          const lastView = Number(
            window.localStorage.getItem(viewKey) ?? 0
          );

          if (now - lastView < VIEW_INTERVAL) {
            shouldCount = false;
          }

          if (shouldCount) {
            window.localStorage.setItem(
              viewKey,
              String(now)
            );
          }
        } catch {
          // 저장소 접근이 차단된 환경에서도 페이지 표시 유지
        }

        if (shouldCount) {
          const { data: updatedViews, error: viewError } =
            await supabase!.rpc(
              "increment_tortoise_post_view",
              {
                target_post_id: postId,
              }
            );

          if (!active) return;

          if (!viewError && typeof updatedViews === "number") {
            setPost((previous) =>
              previous
                ? {
                    ...previous,
                    view_count: updatedViews,
                  }
                : previous
            );
          } else if (viewError) {
            console.error(
              "조회수 업데이트 실패:",
              viewError.message
            );

            try {
              window.localStorage.removeItem(viewKey);
            } catch {
              // 저장소 사용 불가
            }
          }
        }
      }

      if (commentResult.error) {
        setCommentError(
          "댓글을 불러오지 못했습니다."
        );
      } else {
        setComments(
          (commentResult.data ?? []) as Comment[]
        );
      }

      setUser(authResult.data.user ?? null);
      setLoading(false);
    }

    loadData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) {
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [postId, supabase]);

  // 좋아요 수 및 내 좋아요 상태 조회
  useEffect(() => {
    if (!supabase || !postId || !post) return;

    let active = true;

    async function loadLikes() {
      const countResult = await supabase!
        .from("tortoise_post_likes")
        .select("post_id", {
          count: "exact",
          head: true,
        })
        .eq("post_id", postId);

      if (!active) return;

      if (!countResult.error) {
        setLikeCount(countResult.count ?? 0);
      } else {
        console.error(
          "좋아요 수 조회 실패:",
          countResult.error.message
        );
      }

      if (user) {
        const { data, error: likeError } =
          await supabase!
            .from("tortoise_post_likes")
            .select("post_id")
            .eq("post_id", postId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (!active) return;

        if (!likeError) {
          setIsLiked(!!data);
        }
      } else {
        setIsLiked(false);
      }
    }

    loadLikes();

    return () => {
      active = false;
    };
  }, [postId, supabase, user?.id, !!post]);

  function getImageUrl(path: string) {
    if (!supabase) return "";

    return supabase.storage
      .from(BUCKET)
      .getPublicUrl(path).data.publicUrl;
  }

  async function verifyOwner(authorId: string) {
    if (!supabase) return false;

    const { data, error } =
      await supabase.auth.getUser();

    return !error && data.user?.id === authorId;
  }

  async function refreshComments() {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("tortoise_comments")
      .select(commentFields)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      setCommentError(
        "댓글 목록을 불러오지 못했습니다."
      );
    } else {
      setComments(
        (data ?? []) as Comment[]
      );
    }
  }

  async function toggleLike() {
    if (!supabase || !post || liking) return;

    setActionError("");

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      setActionError(
        "좋아요를 누르려면 로그인해 주세요."
      );
      return;
    }

    setLiking(true);

    const userId = authData.user.id;
    let likeError: { message: string } | null = null;

    if (isLiked) {
      const result = await supabase
        .from("tortoise_post_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", userId);

      likeError = result.error;
    } else {
      const result = await supabase
        .from("tortoise_post_likes")
        .insert({
          post_id: post.id,
          user_id: userId,
        });

      likeError = result.error;
    }

    if (likeError) {
      setActionError(
        "좋아요 처리에 실패했습니다. 다시 시도해 주세요."
      );
      console.error(likeError.message);
    }

    // 저장된 실제 데이터 기준으로 UI 갱신
    const [countResult, ownResult] =
      await Promise.all([
        supabase
          .from("tortoise_post_likes")
          .select("post_id", {
            count: "exact",
            head: true,
          })
          .eq("post_id", post.id),

        supabase
          .from("tortoise_post_likes")
          .select("post_id")
          .eq("post_id", post.id)
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

    if (!countResult.error) {
      setLikeCount(countResult.count ?? 0);
    }

    if (!ownResult.error) {
      setIsLiked(!!ownResult.data);
    }

    setLiking(false);
  }

  function clearNewImages() {
    setNewImages((previous) => {
      previous.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });

      return [];
    });
  }

  function startPostEdit() {
    if (
      !post ||
      !user ||
      post.author_id !== user.id
    ) {
      return;
    }

    setPostCategory(post.category);
    setPostTitle(post.title);
    setPostContent(post.content);
    setKeptImages([...post.image_paths]);

    clearNewImages();
    setActionError("");
    setEditingPost(true);
  }

  function cancelPostEdit() {
    if (saving) return;

    clearNewImages();
    setEditingPost(false);
    setActionError("");
    setStatus("");
  }

  function handleImageSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    event.target.value = "";

    if (!files.length) return;

    setActionError("");

    if (
      keptImages.length +
        newImages.length +
        files.length >
      MAX_IMAGES
    ) {
      setActionError(
        `사진은 최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`
      );
      return;
    }

    for (const file of files) {
      if (
        !Object.prototype.hasOwnProperty.call(
          EXTENSIONS,
          file.type
        )
      ) {
        setActionError(
          "JPG, PNG, WEBP 사진만 첨부할 수 있습니다."
        );
        return;
      }

      if (
        file.size === 0 ||
        file.size > MAX_SIZE
      ) {
        setActionError(
          "사진 1장의 크기는 5MB 이하여야 합니다."
        );
        return;
      }
    }

    const selected: NewImage[] =
      files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      }));

    setNewImages((previous) => [
      ...previous,
      ...selected,
    ]);
  }

  function removeNewImage(id: string) {
    setNewImages((previous) => {
      const item = previous.find(
        (image) => image.id === id
      );

      if (item) {
        URL.revokeObjectURL(item.preview);
      }

      return previous.filter(
        (image) => image.id !== id
      );
    });
  }

  async function savePostEdit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!supabase || !post || saving) return;

    const title = postTitle.trim();
    const content = postContent.trim();

    if (
      title.length < 2 ||
      title.length > 100
    ) {
      setActionError(
        "제목은 2~100자로 입력해 주세요."
      );
      return;
    }

    if (
      !content ||
      content.length > 20000
    ) {
      setActionError(
        "본문은 1~20,000자로 입력해 주세요."
      );
      return;
    }

    if (
      keptImages.length +
        newImages.length >
      MAX_IMAGES
    ) {
      setActionError(
        "사진은 최대 5장까지 첨부할 수 있습니다."
      );
      return;
    }

    setSaving(true);
    setActionError("");
    setStatus("");

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (
      authError ||
      !authData.user ||
      authData.user.id !== post.author_id
    ) {
      setSaving(false);
      setActionError(
        "게시글 수정 권한이 없습니다."
      );
      return;
    }

    const currentUser = authData.user;
    const uploadedPaths: string[] = [];
    let databaseSaved = false;

    try {
      for (
        let index = 0;
        index < newImages.length;
        index++
      ) {
        const item = newImages[index];
        const extension =
          EXTENSIONS[item.file.type];

        const path =
          `${currentUser.id}/${crypto.randomUUID()}.${extension}`;

        setStatus(
          `사진 업로드 중... (${index + 1}/${newImages.length})`
        );

        const { error: uploadError } =
          await supabase.storage
            .from(BUCKET)
            .upload(path, item.file, {
              contentType: item.file.type,
              upsert: false,
            });

        if (uploadError) {
          throw new Error(
            `사진 업로드 실패: ${uploadError.message}`
          );
        }

        uploadedPaths.push(path);
      }

      setStatus(
        "게시글 수정 사항 저장 중..."
      );

      const finalPaths = [
        ...keptImages,
        ...uploadedPaths,
      ];

      const { data, error: updateError } =
        await supabase
          .from("tortoise_posts")
          .update({
            category: postCategory,
            title,
            content,
            image_paths: finalPaths,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", post.id)
          .eq(
            "author_id",
            currentUser.id
          )
          .select(postFields)
          .single();

      if (updateError || !data) {
        throw new Error(
          updateError?.message ??
            "게시글 수정에 실패했습니다."
        );
      }

      databaseSaved = true;

      const oldPaths =
        post.image_paths.filter(
          (path) =>
            !keptImages.includes(path)
        );

      setPost({
        ...(data as Post),
        image_paths:
          data.image_paths ?? [],
      });

      setEditingPost(false);
      clearNewImages();
      setStatus("");

      // DB 저장 성공 후 기존 사진 정리
      if (oldPaths.length) {
        const { error: removeError } =
          await supabase.storage
            .from(BUCKET)
            .remove(oldPaths);

        if (removeError) {
          console.error(
            "기존 사진 정리 실패:",
            removeError.message
          );

          setActionError(
            "게시글 수정은 완료됐지만 일부 사진 파일 정리에 실패했습니다."
          );
        }
      }
    } catch (caught) {
      // DB 수정 전 업로드한 파일만 정리
      if (
        !databaseSaved &&
        uploadedPaths.length
      ) {
        const { error: cleanupError } =
          await supabase.storage
            .from(BUCKET)
            .remove(uploadedPaths);

        if (cleanupError) {
          console.error(
            "새 사진 정리 실패:",
            cleanupError.message
          );
        }
      }

      setActionError(
        caught instanceof Error
          ? caught.message
          : "게시글 수정 중 오류가 발생했습니다."
      );
    } finally {
      setSaving(false);
      setStatus("");
    }
  }

  // 게시글 삭제 + 첨부 사진 자동 삭제
  async function deletePost() {
    if (!supabase || !post || saving) return;

    if (
      !window.confirm(
        "게시글과 댓글을 삭제하시겠습니까? 첨부 사진도 함께 삭제됩니다."
      )
    ) {
      return;
    }

    setSaving(true);
    setActionError("");

    if (
      !(await verifyOwner(post.author_id))
    ) {
      setSaving(false);
      setActionError(
        "게시글 삭제 권한이 없습니다."
      );
      return;
    }

    // 먼저 사진 경로를 안전하게 보관
    const imagePaths = [
      ...post.image_paths,
    ];

    // 사진보다 DB 게시글을 먼저 삭제
    // 게시글 삭제에 실패하면 사진을 유지
    const { data, error: deleteError } =
      await supabase
        .from("tortoise_posts")
        .delete()
        .eq("id", post.id)
        .eq(
          "author_id",
          post.author_id
        )
        .select("id");

    if (
      deleteError ||
      !data?.length
    ) {
      setSaving(false);
      setActionError(
        "게시글 삭제에 실패했습니다."
      );
      return;
    }

    // DB 삭제 성공 후 Storage 정리
    if (imagePaths.length > 0) {
      const { error: storageError } =
        await supabase.storage
          .from(BUCKET)
          .remove(imagePaths);

      if (storageError) {
        console.error(
          "첨부 사진 자동 삭제 실패:",
          storageError.message
        );

        window.alert(
          "게시글은 삭제됐지만 일부 사진 파일은 Storage에 남아 있을 수 있습니다. Supabase Storage를 확인해 주세요."
        );
      }
    }

    setSaving(false);

    router.push("/community");
    router.refresh();
  }

  async function submitComment(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !supabase ||
      !post ||
      saving
    ) {
      return;
    }

    const text = commentText.trim();

    if (
      !text ||
      text.length > 2000
    ) {
      setCommentError(
        "댓글은 1~2,000자로 입력해 주세요."
      );
      return;
    }

    setSaving(true);
    setCommentError("");

    const { data, error: authError } =
      await supabase.auth.getUser();

    if (
      authError ||
      !data.user
    ) {
      setSaving(false);
      setUser(null);
      setCommentError(
        "로그인 후 댓글을 작성할 수 있습니다."
      );
      return;
    }

    const { error } =
      await supabase
        .from("tortoise_comments")
        .insert({
          post_id: postId,
          author_id: data.user.id,
          nickname: getNickname(
            data.user
          ),
          content: text,
        });

    setSaving(false);

    if (error) {
      setCommentError(
        "댓글 저장에 실패했습니다."
      );
      return;
    }

    setCommentText("");
    await refreshComments();
  }

  async function saveCommentEdit(
    comment: Comment
  ) {
    if (
      !supabase ||
      !comment.author_id ||
      saving
    ) {
      return;
    }

    const text =
      editingCommentText.trim();

    if (
      !text ||
      text.length > 2000
    ) {
      setCommentError(
        "댓글은 1~2,000자로 입력해 주세요."
      );
      return;
    }

    setSaving(true);
    setCommentError("");

    if (
      !(await verifyOwner(
        comment.author_id
      ))
    ) {
      setSaving(false);
      setCommentError(
        "댓글 수정 권한이 없습니다."
      );
      return;
    }

    const { error } =
      await supabase
        .from("tortoise_comments")
        .update({
          content: text,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", comment.id)
        .eq(
          "author_id",
          comment.author_id
        );

    setSaving(false);

    if (error) {
      setCommentError(
        "댓글 수정에 실패했습니다."
      );
      return;
    }

    setEditingCommentId(null);
    setEditingCommentText("");
    await refreshComments();
  }

  async function deleteComment(
    comment: Comment
  ) {
    if (
      !supabase ||
      !comment.author_id ||
      saving
    ) {
      return;
    }

    if (
      !window.confirm(
        "이 댓글을 삭제하시겠습니까?"
      )
    ) {
      return;
    }

    setSaving(true);
    setCommentError("");

    if (
      !(await verifyOwner(
        comment.author_id
      ))
    ) {
      setSaving(false);
      setCommentError(
        "댓글 삭제 권한이 없습니다."
      );
      return;
    }

    const { data, error } =
      await supabase
        .from("tortoise_comments")
        .delete()
        .eq("id", comment.id)
        .eq(
          "author_id",
          comment.author_id
        )
        .select("id");

    setSaving(false);

    if (
      error ||
      !data?.length
    ) {
      setCommentError(
        "댓글 삭제에 실패했습니다."
      );
      return;
    }

    await refreshComments();
  }

  const isPostOwner =
    !!post &&
    !!user &&
    post.author_id === user.id;

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
        <div className="mt-8 rounded-3xl bg-white p-12 text-center">
          게시글을 불러오는 중입니다...
        </div>
      ) : error || !post ? (
        <section className="mt-8 rounded-3xl bg-white p-12 text-center">
          <Turtle
            size={42}
            className="mx-auto text-[#9db69d]"
          />
          <h1 className="font-hand mt-5 text-3xl">
            게시글을 찾을 수 없어요
          </h1>
          <p className="mt-4 text-sm text-[#819482]">
            {error}
          </p>
        </section>
      ) : (
        <>
          <article className="mt-8 overflow-hidden rounded-[24px] border border-[#e3e9df] bg-white shadow-sm">
            <header className="border-b border-[#edf0e9] bg-[#f5f9f2] px-6 py-9 md:px-10">
              {editingPost ? (
                <form
                  onSubmit={savePostEdit}
                  className="space-y-5"
                >
                  <h1 className="font-hand text-3xl">
                    게시글 수정
                  </h1>

                  <div>
                    <label
                      htmlFor="edit-category"
                      className="mb-2 block text-sm font-bold"
                    >
                      게시판
                    </label>
                    <select
                      id="edit-category"
                      value={postCategory}
                      disabled={saving}
                      onChange={(event) =>
                        setPostCategory(
                          event.target.value as Category
                        )
                      }
                      className="w-full rounded-xl border border-[#dce7d8] bg-white p-3 text-sm"
                    >
                      <option value="free">
                        자유게시판
                      </option>
                      <option value="tips">
                        정보 및 TIP 공유하기
                      </option>
                      <option value="question">
                        질문
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-title"
                      className="mb-2 block text-sm font-bold"
                    >
                      제목
                    </label>
                    <input
                      id="edit-title"
                      value={postTitle}
                      disabled={saving}
                      onChange={(event) =>
                        setPostTitle(
                          event.target.value
                        )
                      }
                      maxLength={100}
                      required
                      className="w-full rounded-xl border border-[#dce7d8] bg-white p-3 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-content"
                      className="mb-2 block text-sm font-bold"
                    >
                      내용
                    </label>
                    <textarea
                      id="edit-content"
                      value={postContent}
                      disabled={saving}
                      onChange={(event) =>
                        setPostContent(
                          event.target.value
                        )
                      }
                      maxLength={20000}
                      rows={12}
                      required
                      className="w-full rounded-xl border border-[#dce7d8] bg-white p-4 text-sm leading-7"
                    />
                  </div>

                  {/* 사진 수정 */}
                  <div className="border-t border-[#e3e9df] pt-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-sm font-bold">
                        <ImageIcon size={18} />
                        사진 수정
                      </h2>
                      <span className="text-xs text-[#829482]">
                        {keptImages.length +
                          newImages.length}
                        {" / "}
                        {MAX_IMAGES}장
                      </span>
                    </div>

                    <p className="mb-4 text-xs leading-6 text-[#829482]">
                      기존 사진을 제외하거나
                      새 사진을 추가할 수 있습니다.
                      수정 완료를 누르면 저장됩니다.
                    </p>

                    {(keptImages.length > 0 ||
                      newImages.length > 0) && (
                      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {keptImages.map(
                          (path, index) => (
                            <div
                              key={path}
                              className="relative aspect-square overflow-hidden rounded-2xl bg-[#eef3ea]"
                            >
                              <Image
                                src={getImageUrl(
                                  path
                                )}
                                alt={`기존 사진 ${index + 1}`}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() =>
                                  setKeptImages(
                                    (previous) =>
                                      previous.filter(
                                        (item) =>
                                          item !==
                                          path
                                      )
                                  )
                                }
                                aria-label="기존 사진 제외"
                                className="absolute right-2 top-2 rounded-full bg-white/95 p-2 text-red-500 shadow-sm disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )
                        )}

                        {newImages.map(
                          (item) => (
                            <div
                              key={item.id}
                              className="relative aspect-square overflow-hidden rounded-2xl bg-[#eef3ea]"
                            >
                              <Image
                                src={item.preview}
                                alt={
                                  item.file.name
                                }
                                fill
                                unoptimized
                                className="object-cover"
                              />

                              <span className="absolute bottom-2 left-2 rounded-full bg-[#668b6c] px-2 py-1 text-[10px] font-bold text-white">
                                새 사진
                              </span>

                              <button
                                type="button"
                                disabled={saving}
                                onClick={() =>
                                  removeNewImage(
                                    item.id
                                  )
                                }
                                aria-label="새 사진 제외"
                                className="absolute right-2 top-2 rounded-full bg-white/95 p-2 text-red-500 shadow-sm disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={saving}
                      onChange={
                        handleImageSelect
                      }
                      className="hidden"
                      aria-label="추가할 사진 선택"
                    />

                    <button
                      type="button"
                      disabled={
                        saving ||
                        keptImages.length +
                          newImages.length >=
                          MAX_IMAGES
                      }
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#cddfca] bg-white px-5 py-8 text-[#719273] hover:bg-[#f0f7ed] disabled:opacity-50"
                    >
                      <ImagePlus size={28} />

                      <span className="mt-3 text-sm font-bold">
                        사진 추가하기
                      </span>

                      <span className="mt-2 text-xs">
                        JPG, PNG, WEBP ·
                        1장당 최대 5MB
                      </span>
                    </button>
                  </div>

                  {actionError && (
                    <p
                      role="alert"
                      className="rounded-xl bg-red-50 p-4 text-sm text-red-600"
                    >
                      {actionError}
                    </p>
                  )}

                  {status && (
                    <p
                      role="status"
                      className="rounded-xl bg-[#edf4e9] p-4 text-sm text-[#62866a]"
                    >
                      {status}
                    </p>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={
                        cancelPostEdit
                      }
                      className="rounded-full border border-[#dce7d8] bg-white px-6 py-3 text-sm disabled:opacity-50"
                    >
                      취소
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                    >
                      {saving
                        ? "저장 중..."
                        : "수정 완료"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <span className="inline-flex rounded-full bg-[#e4efdf] px-4 py-2 text-xs font-bold text-[#62866a]">
                    {
                      categoryNames[
                        post.category
                      ]
                    }
                  </span>

                  <h1 className="font-hand mt-6 break-words text-3xl md:text-4xl">
                    {post.title}
                  </h1>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#829482]">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays
                          size={15}
                        />
                        {formatDate(
                          post.created_at
                        )}
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Eye size={15} />
                        조회{" "}
                        {post.view_count.toLocaleString(
                          "ko-KR"
                        )}
                      </span>
                    </div>

                    {isPostOwner && (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={
                            startPostEdit
                          }
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#668b6c]"
                        >
                          <Pencil
                            size={15}
                          />
                          수정
                        </button>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={
                            deletePost
                          }
                          className="inline-flex items-center gap-1 text-xs font-bold text-red-500"
                        >
                          <Trash2
                            size={15}
                          />
                          삭제
                        </button>
                      </div>
                    )}
                  </div>

                  {actionError && (
                    <p
                      role="alert"
                      className="mt-4 text-sm text-red-600"
                    >
                      {actionError}
                    </p>
                  )}
                </>
              )}
            </header>

            {!editingPost && (
              <div className="px-6 py-10 md:px-10">
                <div className="min-h-[120px] whitespace-pre-wrap break-words text-sm leading-8 md:text-base">
                  {post.content}
                </div>

                {post.image_paths.length >
                  0 && (
                  <section className="mt-9 border-t border-[#edf0e9] pt-8">
                    <div className="mb-5 flex items-center gap-2 text-[#668b6c]">
                      <ImageIcon
                        size={20}
                      />
                      <h2 className="text-sm font-bold">
                        첨부 사진{" "}
                        {
                          post.image_paths
                            .length
                        }
                        장
                      </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {post.image_paths.map(
                        (path, index) => (
                          <a
                            key={`${path}-${index}`}
                            href={getImageUrl(
                              path
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block overflow-hidden rounded-2xl border border-[#e3e9df] bg-[#f4f7f1]"
                            aria-label={`첨부 사진 ${index + 1} 크게 보기`}
                          >
                            <div className="relative aspect-[4/3]">
                              <Image
                                src={getImageUrl(
                                  path
                                )}
                                alt={`게시글 첨부 사진 ${index + 1}`}
                                fill
                                unoptimized
                                sizes="(max-width: 640px) 100vw, 50vw"
                                className="object-contain"
                              />
                            </div>
                          </a>
                        )
                      )}
                    </div>
                  </section>
                )}

                {/* 좋아요 */}
                <div className="mt-10 flex flex-col items-center border-t border-[#edf0e9] pt-8">
                  <button
                    type="button"
                    disabled={
                      liking || saving
                    }
                    onClick={
                      toggleLike
                    }
                    aria-pressed={
                      isLiked
                    }
                    className={`inline-flex items-center gap-3 rounded-full border px-7 py-3 text-sm font-bold transition disabled:opacity-50 ${
                      isLiked
                        ? "border-[#efc5c8] bg-[#fff0f1] text-[#de7481]"
                        : "border-[#dce7d8] bg-white text-[#718573] hover:bg-[#f5f9f2]"
                    }`}
                  >
                    <Heart
                      size={20}
                      fill={
                        isLiked
                          ? "currentColor"
                          : "none"
                      }
                    />
                    {isLiked
                      ? "좋아요 취소"
                      : "좋아요"}
                    <span>
                      {
                        likeCount.toLocaleString(
                          "ko-KR"
                        )
                      }
                    </span>
                  </button>

                  {!user && (
                    <p className="mt-3 text-xs text-[#9baa99]">
                      좋아요는 로그인 후
                      누를 수 있습니다.
                    </p>
                  )}
                </div>
              </div>
            )}
          </article>

          {/* 댓글 영역 */}
          <section className="mt-8 rounded-[24px] border border-[#e3e9df] bg-white px-6 py-9 md:px-10">
            <div className="flex items-center gap-2">
              <MessageCircle
                size={23}
                className="text-[#719273]"
              />
              <h2 className="font-hand text-2xl">
                댓글 {comments.length}
              </h2>
            </div>

            {commentError && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {commentError}
              </p>
            )}

            <div className="mt-7 divide-y divide-[#edf0e9]">
              {comments.length === 0 ? (
                <div className="rounded-2xl bg-[#f7faf5] px-5 py-10 text-center text-sm text-[#819482]">
                  아직 댓글이 없어요.
                  첫 댓글을 남겨주세요!
                </div>
              ) : (
                comments.map(
                  (comment) => {
                    const isOwner =
                      !!user &&
                      comment.author_id ===
                        user.id;

                    return (
                      <div
                        key={
                          comment.id
                        }
                        className="py-6"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-sm font-bold">
                              {
                                comment.nickname
                              }
                            </span>
                            <span className="ml-3 text-xs text-[#9baa99]">
                              {formatDate(
                                comment.created_at
                              )}
                            </span>
                          </div>

                          {isOwner && (
                            <div className="flex gap-3">
                              <button
                                type="button"
                                disabled={
                                  saving
                                }
                                onClick={() => {
                                  setEditingCommentId(
                                    comment.id
                                  );
                                  setEditingCommentText(
                                    comment.content
                                  );
                                }}
                                className="inline-flex items-center gap-1 text-xs text-[#668b6c]"
                              >
                                <Pencil
                                  size={14}
                                />
                                수정
                              </button>

                              <button
                                type="button"
                                disabled={
                                  saving
                                }
                                onClick={() =>
                                  deleteComment(
                                    comment
                                  )
                                }
                                className="inline-flex items-center gap-1 text-xs text-red-500"
                              >
                                <Trash2
                                  size={14}
                                />
                                삭제
                              </button>
                            </div>
                          )}
                        </div>

                        {editingCommentId ===
                        comment.id ? (
                          <div className="mt-4">
                            <textarea
                              value={
                                editingCommentText
                              }
                              onChange={(
                                event
                              ) =>
                                setEditingCommentText(
                                  event
                                    .target
                                    .value
                                )
                              }
                              maxLength={
                                2000
                              }
                              rows={4}
                              className="w-full rounded-xl border border-[#dce7d8] p-4 text-sm"
                            />

                            <div className="mt-3 flex justify-end gap-3">
                              <button
                                type="button"
                                disabled={
                                  saving
                                }
                                onClick={() => {
                                  setEditingCommentId(
                                    null
                                  );
                                  setEditingCommentText(
                                    ""
                                  );
                                }}
                                className="rounded-full border px-5 py-2 text-xs"
                              >
                                취소
                              </button>

                              <button
                                type="button"
                                disabled={
                                  saving
                                }
                                onClick={() =>
                                  saveCommentEdit(
                                    comment
                                  )
                                }
                                className="rounded-full bg-[#668b6c] px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
                              >
                                수정 완료
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#627663]">
                            {
                              comment.content
                            }
                          </p>
                        )}
                      </div>
                    );
                  }
                )
              )}
            </div>

            <div className="mt-8 border-t border-[#edf0e9] pt-8">
              {user ? (
                <form
                  onSubmit={
                    submitComment
                  }
                >
                  <p className="mb-3 text-sm font-bold">
                    댓글 작성
                  </p>

                  <textarea
                    value={
                      commentText
                    }
                    onChange={(
                      event
                    ) =>
                      setCommentText(
                        event.target.value
                      )
                    }
                    maxLength={2000}
                    rows={4}
                    placeholder="따뜻한 댓글을 남겨주세요."
                    className="w-full rounded-xl border border-[#dce7d8] p-4 text-sm leading-7"
                    required
                  />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-[#9baa99]">
                      {
                        commentText.length
                      }{" "}
                      / 2,000
                    </span>

                    <button
                      type="submit"
                      disabled={
                        saving
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                    >
                      <Send
                        size={16}
                      />
                      {saving
                        ? "처리 중..."
                        : "댓글 등록"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-2xl bg-[#f1f6ed] px-6 py-8 text-center">
                  <LockKeyhole
                    size={28}
                    className="mx-auto text-[#719273]"
                  />

                  <p className="mt-4 text-sm text-[#718573]">
                    댓글을 작성하려면
                    로그인이 필요합니다.
                  </p>

                  <Link
                    href="/login"
                    className="mt-5 inline-flex rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white"
                  >
                    로그인하러 가기
                  </Link>
                </div>
              )}
            </div>
          </section>

          <div className="mt-8 flex justify-center">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 rounded-full bg-[#668b6c] px-7 py-3 text-sm font-bold text-white"
            >
              <ArrowLeft
                size={17}
              />
              게시글 목록
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
