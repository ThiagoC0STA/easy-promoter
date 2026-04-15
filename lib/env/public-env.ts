/**
 * Public Supabase configuration (browser and server RLS client).
 * Uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (Supabase publishable / anon key).
 */
export function getPublicSupabaseConfig(): { url: string; publishableKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url?.trim() || !publishableKey?.trim()) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return { url: url.trim(), publishableKey: publishableKey.trim() };
}
