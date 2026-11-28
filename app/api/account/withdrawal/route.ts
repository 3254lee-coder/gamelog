import { createClient } from "@supabase/supabase-js";
import { processVerifiedWithdrawal } from "@/lib/withdrawal-runner.mjs";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (process.env.WITHDRAWAL_PROCESSING_ENABLED !== "true" || !url || !key) {
    return Response.json({ status: "queued" }, { status: 202 });
  }
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return new Response(null, { status: 401 });
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return new Response(null, { status: 401 });
  try {
    const done = await processVerifiedWithdrawal(db, data.user.id, 3);
    return Response.json(
      { status: done ? "complete" : "queued" },
      { status: done ? 200 : 202 },
    );
  } catch (error) {
    // Keep retry details server-side and redact UUIDs before writing diagnostic logs.
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(
      "[withdrawal] processing failed:",
      message.replace(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        "[uuid]",
      ),
    );
    // The durable request remains available for the trusted retry worker.
    return Response.json({ status: "pending-review" }, { status: 503 });
  }
}
