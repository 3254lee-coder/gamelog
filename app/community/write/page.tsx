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
