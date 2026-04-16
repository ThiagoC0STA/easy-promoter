export const GENRES = [
  "Funk",
  "Eletrônica",
  "Sertanejo",
  "Trap",
  "Pop",
  "Rock",
  "Pagode",
  "Rap",
  "Reggaeton",
  "Forró",
  "MPB",
  "House",
  "Techno",
  "Hip Hop",
  "Outro",
] as const;

export type Genre = (typeof GENRES)[number];

export const SEGMENTS = [
  { value: "mailing", label: "Mailing" },
  { value: "posta", label: "Posta" },
  { value: "gasta_bem", label: "Gasta bem" },
] as const;

export type SegmentValue = (typeof SEGMENTS)[number]["value"];

export const FREQUENCY_OPTIONS = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
] as const;

export const SPENDING_OPTIONS = [
  { value: "sim", label: "Sim" },
  { value: "medio", label: "Médio" },
  { value: "nao", label: "Não" },
] as const;

export const POST_TYPE_OPTIONS = [
  { value: "story", label: "Story" },
  { value: "feed", label: "Feed" },
  { value: "ambos", label: "Ambos" },
] as const;

export const REACH_OPTIONS = [
  { value: "baixo", label: "Baixo" },
  { value: "medio", label: "Médio" },
  { value: "alto", label: "Alto" },
] as const;

export const CONFIRMED_OPTIONS = [
  { value: "sim", label: "Sim" },
  { value: "provavel", label: "Provável" },
  { value: "nao", label: "Não" },
] as const;

export const RESPONDED_OPTIONS = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
  { value: "sem_retorno", label: "Sem retorno" },
] as const;

export type Contact = {
  id: string;
  owner_id: string;
  name: string;
  whatsapp: string | null;
  instagram: string | null;
  birthday: string | null;
  genres: string[];
  segments: string[];
  frequency: string | null;
  spending: string | null;
  post_type: string | null;
  reach: string | null;
  confirmed: string | null;
  responded: string | null;
  last_contacted_at: string | null;
  notes: string | null;
  group_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactInsert = Omit<Contact, "id" | "created_at" | "updated_at">;
export type ContactUpdate = Partial<Omit<ContactInsert, "owner_id">>;

export const COOLDOWN_DAYS = 10;
