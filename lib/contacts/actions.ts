"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-profile";
import {
  createContact,
  deleteContact,
  touchContact,
  updateContact,
} from "./queries";
import type { ContactInsert, ContactUpdate } from "./types";

function parseFormGenres(formData: FormData): string[] {
  const raw = formData.get("genres");
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseFormSegments(formData: FormData): string[] {
  return formData.getAll("segments").map(String).filter(Boolean);
}

function str(formData: FormData, key: string): string | null {
  const val = formData.get(key);
  if (!val || typeof val !== "string" || !val.trim()) return null;
  return val.trim();
}

function buildPayload(
  formData: FormData,
): Omit<ContactInsert, "owner_id"> {
  return {
    name: str(formData, "name") ?? "",
    whatsapp: str(formData, "whatsapp"),
    instagram: str(formData, "instagram"),
    birthday: str(formData, "birthday"),
    genres: parseFormGenres(formData),
    segments: parseFormSegments(formData),
    frequency: str(formData, "frequency"),
    spending: str(formData, "spending"),
    post_type: str(formData, "post_type"),
    reach: str(formData, "reach"),
    confirmed: str(formData, "confirmed"),
    responded: str(formData, "responded"),
    last_contacted_at: str(formData, "last_contacted_at"),
    notes: str(formData, "notes"),
  };
}

export async function createContactAction(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const payload = buildPayload(formData);
  await createContact({ ...payload, owner_id: user.id });

  revalidatePath("/app");
  revalidatePath("/app/contacts");
  redirect("/app/contacts");
}

export async function updateContactAction(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const id = formData.get("id");
  if (!id || typeof id !== "string") throw new Error("Missing contact id");

  const payload: ContactUpdate = buildPayload(formData);
  await updateContact(id, payload);

  revalidatePath("/app");
  revalidatePath("/app/contacts");
  redirect("/app/contacts");
}

export async function deleteContactAction(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const id = formData.get("id");
  if (!id || typeof id !== "string") throw new Error("Missing contact id");

  await deleteContact(id);

  revalidatePath("/app");
  revalidatePath("/app/contacts");
  redirect("/app/contacts");
}

export async function touchContactAction(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const id = formData.get("id");
  if (!id || typeof id !== "string") throw new Error("Missing contact id");

  await touchContact(id);
  revalidatePath("/app");
  revalidatePath("/app/contacts");
}

export async function touchContactByIdAction(contactId: string) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  await touchContact(contactId);
  revalidatePath("/app");
  revalidatePath("/app/contacts");
}
