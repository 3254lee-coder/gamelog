export async function processVerifiedWithdrawal(
  db,
  member,
  maxBatches = Infinity,
) {
  let previous = "";
  for (let batch = 0; batch < maxBatches; batch++) {
    const { data, error } = await db.rpc("lt_withdrawal_photos", { member });
    if (error) throw error;
    if (!Array.isArray(data))
      throw new Error("사진 목록을 확인하지 못했습니다.");
    if (!data.length) {
      const result = await db.auth.admin.deleteUser(member);
      if (result.error) throw result.error;
      return true;
    }
    const signature = JSON.stringify(data);
    if (signature === previous)
      throw new Error(
        "사진 정리가 진행되지 않았습니다. Storage 상태 확인 후 재시도하세요.",
      );
    previous = signature;
    for (const bucket of new Set(data.map((row) => row.bucket))) {
      const paths = data
        .filter((row) => row.bucket === bucket)
        .map((row) => row.path);
      if (
        !["tortoise-growth-photos", "tortoise-post-images"].includes(bucket) ||
        paths.some((path) => !path.startsWith(member + "/"))
      )
        throw new Error("사진 소유 범위를 확인하세요.");
      const removed = await db.storage.from(bucket).remove(paths);
      if (removed.error) throw removed.error;
    }
  }
  return false;
}
