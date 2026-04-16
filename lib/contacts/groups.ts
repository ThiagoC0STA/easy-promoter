import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ContactGroup = {
  id: string;
  owner_id: string;
  name: string;
  position: number;
  created_at: string;
};

export async function getContactGroups(): Promise<ContactGroup[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contact_groups")
    .select("id, owner_id, name, position, created_at")
    .order("position", { ascending: true });

  if (error) {
    // Table might not exist yet — return empty gracefully
    if (error.code === "42P01") return [];
    throw error;
  }
  return (data ?? []) as ContactGroup[];
}

export async function getContactGroupsByOwner(
  ownerId: string,
): Promise<ContactGroup[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contact_groups")
    .select("id, owner_id, name, position, created_at")
    .eq("owner_id", ownerId)
    .order("position", { ascending: true });

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }
  return (data ?? []) as ContactGroup[];
}

export async function createContactGroup(
  name: string,
): Promise<ContactGroup | null> {
  const supabase = await createServerSupabaseClient();

  // Get current max position
  const { data: existing } = await supabase
    .from("contact_groups")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = existing ? existing.position + 1 : 0;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("contact_groups")
    .insert({ name: name.trim(), position, owner_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as ContactGroup;
}

export async function renameContactGroup(
  id: string,
  name: string,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("contact_groups")
    .update({ name: name.trim() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteContactGroup(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  // Contacts with this group_id will have group_id set to NULL (ON DELETE SET NULL)
  const { error } = await supabase
    .from("contact_groups")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
