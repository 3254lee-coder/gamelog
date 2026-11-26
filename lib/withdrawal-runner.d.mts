import type { SupabaseClient } from "@supabase/supabase-js";
export function processVerifiedWithdrawal(db: SupabaseClient, member: string, maxBatches?: number): Promise<boolean>;
