import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "@/lib/env/public-env";

/**
 * Service role client: bypasses RLS. Use only on the server (Route Handlers,
 * Server Actions, Edge Functions). Never import from client components.
 */
export function createServiceRoleSupabaseClient() {
  const serviceKey = process.env.SERVICE_ROLE_KEY;
  if (!serviceKey?.trim()) {
    throw new Error("Missing SERVICE_ROLE_KEY (server only)");
  }

  const { url } = getPublicSupabaseConfig();

  return createClient(url, serviceKey.trim(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
