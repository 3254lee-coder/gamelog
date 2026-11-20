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
                    className="w-full min-w-0 rounded-xl border border-[#dce7d8] p-4 text-base leading-7 outline-none focus:border-[#83a78a] sm:text-sm"
                    required
                  />

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
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
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#668b6c] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
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
                <div className="rounded-2xl bg-[#f1f6ed] px-4 py-8 text-center sm:px-6">
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

          <div className="mt-7 flex justify-center sm:mt-8">
            <Link
              href="/community"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#668b6c] px-7 py-3 text-sm font-bold text-white"
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
