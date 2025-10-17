import { createClient } from "@supabase/supabase-js";

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "環境変数 NEXT_PUBLIC_SUPABASE_URL (または SUPABASE_URL) と SUPABASE_SERVICE_ROLE_KEY を設定してください。"
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
    },
  });
}
