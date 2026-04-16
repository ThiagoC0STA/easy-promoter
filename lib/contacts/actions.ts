"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-profile";
import {
  createContact,
  deleteContact,
  getContactById,
  touchContact,
  updateContact,
} from "./queries";
import type { Contact } from "./types";
import {
  createContactGroup,
  renameContactGroup,
  deleteContactGroup,
} from "./groups";
import type { ImportContactPayload } from "./csv-import";
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
  const separator = path.includes("?") ? "&" : "?";
  redirect(
    `${path}${separator}error=${encodeURIComponent(userFacingContactSaveError(error))}`,
  );
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
    group_id: str(formData, "group_id"),
  };
}

export async function createContactAction(formData: FormData) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const payload = buildPayload(formData);
  try {
    await createContact({ ...payload, owner_id: user.id });
  } catch (e) {
    const tabParam = payload.group_id ? `&tab=${payload.group_id}` : "";
    redirectWithContactError(`/app/contacts?novo=1${tabParam}`, e);
  }

  revalidatePath("/app");
  revalidatePath("/app/contacts");
  redirect(payload.group_id ? `/app/contacts?tab=${payload.group_id}` : "/app/contacts");
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
    redirectWithContactError(`/app/contacts?edit=${id}`, e);
  }

  revalidatePath("/app");
  revalidatePath("/app/contacts");
  const tabParam = payload.group_id ? `?tab=${payload.group_id}` : "";
  redirect(`/app/contacts${tabParam}`);
}

export type FetchContactResult =
  | { ok: true; contact: Contact }
  | { ok: false; message: string };

export async function fetchContactByIdAction(
  id: string,
): Promise<FetchContactResult> {
  const { user } = await getCurrentUser();
  if (!user) return { ok: false, message: "Sessão expirada." };
  try {
    const contact = await getContactById(id);
    if (!contact) return { ok: false, message: "Contato não encontrado." };
    return { ok: true, contact };
  } catch (e) {
    return { ok: false, message: userFacingContactSaveError(e) };
  }
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
    redirectWithContactError(`/app/contacts?edit=${id}`, e);
  }

  revalidatePath("/app");
  revalidatePath("/app/contacts");
  redirect("/app/contacts");
}

const IMPORT_MAX_ROWS = 200;

export type ImportContactsBulkResult =
  | { ok: true; inserted: number; errors: string[] }
  | { ok: false; message: string };

export async function importContactsBulkAction(
  formData: FormData,
): Promise<ImportContactsBulkResult> {
  const { user } = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Sessão expirada. Entre de novo." };
  }

  const raw = formData.get("payload");
  if (typeof raw !== "string" || !raw.trim()) {
    return { ok: false, message: "Nenhum dado para importar." };
  }

  let rows: ImportContactPayload[];
  try {
    rows = JSON.parse(raw) as ImportContactPayload[];
  } catch {
    return { ok: false, message: "Formato de dados inválido." };
  }

  if (!Array.isArray(rows)) {
    return { ok: false, message: "Lista de contatos inválida." };
  }

  if (rows.length > IMPORT_MAX_ROWS) {
    return {
      ok: false,
      message: `Máximo de ${IMPORT_MAX_ROWS} linhas por importação. Divida o arquivo.`,
    };
  }

  const errors: string[] = [];
  let inserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r?.name?.trim()) {
      errors.push(`Linha ${i + 1}: nome obrigatório.`);
      continue;
    }

    const payload: ContactInsert = {
      owner_id: user.id,
      name: r.name.trim(),
      whatsapp: r.whatsapp?.trim() || null,
      instagram: r.instagram?.trim() || null,
      birthday: r.birthday?.trim() || null,
      genres: Array.isArray((r as { genres?: string[] }).genres) ? (r as { genres?: string[] }).genres! : [],
      segments: Array.isArray(r.segments) ? r.segments : [],
      frequency: null,
      spending: null,
      post_type: null,
      reach: null,
      confirmed: null,
      responded: null,
      last_contacted_at: null,
      notes: (r as { notes?: string | null }).notes ?? null,
      group_id: null,
    };

    try {
      await createContact(payload);
      inserted++;
    } catch (e) {
      errors.push(`Linha ${i + 1}: ${userFacingContactSaveError(e)}`);
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/contacts");
  return { ok: true, inserted, errors };
}

// ─── Contact group actions ───────────────────────────────────────────────────

export type GroupActionResult = { ok: true; id?: string } | { ok: false; message: string };

export async function createGroupAction(name: string): Promise<GroupActionResult> {
  const { user } = await getCurrentUser();
  if (!user) return { ok: false, message: "Sessão expirada." };
  try {
    const group = await createContactGroup(name.trim() || "Nova lista");
    revalidatePath("/app/contacts");
    return { ok: true, id: group?.id };
  } catch (e) {
    return { ok: false, message: String((e as Error).message) };
  }
}

export async function renameGroupAction(id: string, name: string): Promise<GroupActionResult> {
  const { user } = await getCurrentUser();
  if (!user) return { ok: false, message: "Sessão expirada." };
  try {
    await renameContactGroup(id, name.trim());
    revalidatePath("/app/contacts");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: String((e as Error).message) };
  }
}

export async function deleteGroupAction(id: string): Promise<GroupActionResult> {
  const { user } = await getCurrentUser();
  if (!user) return { ok: false, message: "Sessão expirada." };
  try {
    await deleteContactGroup(id);
    revalidatePath("/app/contacts");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: String((e as Error).message) };
  }
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
