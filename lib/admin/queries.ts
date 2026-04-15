import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/auth/types";

export async function getPromoters(): Promise<Profile[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Profile[];
}
