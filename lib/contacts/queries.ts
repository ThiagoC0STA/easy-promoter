import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Contact, ContactInsert, ContactUpdate } from "./types";

export type ContactFilters = {
  search?: string;
  genres?: string[];
  segments?: string[];
  sortBy?: "last_contacted_at" | "name" | "birthday";
  sortDir?: "asc" | "desc";
};

const CONTACT_COLUMNS =
  "id, owner_id, name, whatsapp, instagram, birthday, genres, segments, frequency, spending, post_type, reach, confirmed, responded, last_contacted_at, notes, group_id, created_at, updated_at";

export type GetContactsOptions = ContactFilters & {
  /** null = show contacts with no group (default "Geral" tab) */
  groupId?: string | null;
};

export async function getContacts(
  filters: GetContactsOptions = {},
): Promise<Contact[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("contacts").select(CONTACT_COLUMNS);

  // Filter by group: undefined = all contacts (admin view), null = ungrouped, string = specific group
  if (filters.groupId !== undefined) {
    if (filters.groupId === null) {
      query = query.is("group_id", null);
    } else {
      query = query.eq("group_id", filters.groupId);
    }
  }

  if (filters.search?.trim()) {
    query = query.ilike("name", `%${filters.search.trim()}%`);
  }

  if (filters.genres?.length) {
    query = query.overlaps("genres", filters.genres);
  }

  if (filters.segments?.length) {
    query = query.overlaps("segments", filters.segments);
  }

  const sortBy = filters.sortBy ?? "last_contacted_at";
  const sortDir = filters.sortDir ?? "asc";

  query = query.order(sortBy, {
    ascending: sortDir === "asc",
    nullsFirst: sortBy === "last_contacted_at",
  });

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as Contact[];
}

export async function getContactsByOwner(
  ownerId: string,
): Promise<Contact[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contacts")
    .select(CONTACT_COLUMNS)
    .eq("owner_id", ownerId)
    .order("last_contacted_at", { ascending: true, nullsFirst: true });

  if (error) throw error;
  return (data ?? []) as Contact[];
}

export async function getContactById(
  id: string,
): Promise<Contact | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contacts")
    .select(CONTACT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Contact | null;
}

export async function createContact(
  input: ContactInsert,
): Promise<Contact> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contacts")
    .insert(input)
    .select(CONTACT_COLUMNS)
    .single();

  if (error) throw error;
  return data as Contact;
}

export async function updateContact(
  id: string,
  input: ContactUpdate,
): Promise<Contact> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contacts")
    .update(input)
    .eq("id", id)
    .select(CONTACT_COLUMNS)
    .single();

  if (error) throw error;
  return data as Contact;
}

export async function deleteContact(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("contacts").delete().eq("id", id);

  if (error) throw error;
}

export async function touchContact(id: string): Promise<Contact> {
  return updateContact(id, {
    last_contacted_at: new Date().toISOString(),
  });
}
