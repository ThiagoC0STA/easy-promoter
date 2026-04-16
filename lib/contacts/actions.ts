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

function userFacingContactSaveError(error: unknown): string {
  if (error instanceof Error && error.message === "missing id") {
    return "Não foi possível identificar o contato. Volte à lista e tente de novo.";
  }
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code?: string }).code);
    if (code === "23505") {
      return "Este registro conflita com outro já salvo. Revise os dados e tente de novo.";
    }
    if (code === "PGRST116") {
      return "Contato não encontrado ou você não tem permissão para esta ação.";
    }
  }
  return "Não foi possível concluir a ação. Verifique a conexão e tente de novo.";
}

function redirectWithContactError(path: string, error: unknown): never {
  redirect(`${path}?error=${encodeURIComponent(userFacingContactSaveError(error))}`);
}

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
  try {
    await createContact({ ...payload, owner_id: user.id });
  } catch (e) {
    redirectWithContactError("/app/contacts/new", e);
  }

  revalidatePath("/app");
  revalidatePath("/app/contacts");
  redirect("/app/contacts");
}

export async function updateContactAction(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const idRaw = formData.get("id");
  if (typeof idRaw !== "string" || !idRaw) {
    redirectWithContactError("/app/contacts", new Error("missing id"));
  }
  const id = idRaw;

  const payload: ContactUpdate = buildPayload(formData);
  try {
    await updateContact(id, payload);
  } catch (e) {
    redirectWithContactError(`/app/contacts/${id}/edit`, e);
  }

  revalidatePath("/app");
  revalidatePath("/app/contacts");
  redirect("/app/contacts");
}

export async function deleteContactAction(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const idRaw = formData.get("id");
  if (typeof idRaw !== "string" || !idRaw) {
    redirectWithContactError("/app/contacts", new Error("missing id"));
  }
  const id = idRaw;

  try {
    await deleteContact(id);
  } catch (e) {
    redirectWithContactError(`/app/contacts/${id}/edit`, e);
  }

  revalidatePath("/app");
  revalidatePath("/app/contacts");
  redirect("/app/contacts");
}

export type TouchContactResult =
  | { ok: true }
  | { ok: false; message: string };

export async function touchContactByIdAction(
  contactId: string,
): Promise<TouchContactResult> {
  const { user } = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Sessão expirada. Entre de novo." };
  }

  try {
    await touchContact(contactId);
  } catch (e) {
    return { ok: false, message: userFacingContactSaveError(e) };
  }

  revalidatePath("/app");
  revalidatePath("/app/contacts");
  return { ok: true };
}
