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
          <section className="mt-5 min-w-0 rounded-[20px] border border-[#e3e9df] bg-white px-4 py-7 sm:mt-8 sm:rounded-[24px] sm:px-6 sm:py-9 md:px-10">
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
                        className="min-w-0 py-5 sm:py-6"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 sm:items-center sm:gap-3">
                          <div>
                            <span className="text-sm font-bold">
                              {
                                comment.nickname
                              }
                            </span>
                            <span className="ml-0 mt-1 block text-[11px] text-[#9baa99] sm:ml-3 sm:mt-0 sm:inline sm:text-xs">
                              {formatDate(
                                comment.created_at
                              )}
                            </span>
                          </div>

                          {isOwner && (
                            <div className="flex items-center gap-2 sm:gap-3">
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
                                className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs text-[#668b6c]"
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
                                className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs text-red-500"
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
                              className="w-full min-w-0 rounded-xl border border-[#dce7d8] p-4 text-base outline-none focus:border-[#83a78a] sm:text-sm"
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
                                className="min-h-11 rounded-full border px-5 py-2 text-xs"
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
                                className="min-h-11 rounded-full bg-[#668b6c] px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
                              >
                                수정 완료
                              </button>
                            </div>
