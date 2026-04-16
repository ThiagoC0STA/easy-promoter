import { COOLDOWN_DAYS } from "./types";

export function daysSinceContact(lastContactedAt: string | null): number | null {
  if (!lastContactedAt) return null;
  const diff = Date.now() - new Date(lastContactedAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * True when last_contacted_at falls within the last `windowDays` calendar days (0 = today).
 */
export function wasContactedWithinRollingDays(
  lastContactedAt: string | null,
  windowDays: number,
): boolean {
  const d = daysSinceContact(lastContactedAt);
  return d !== null && d >= 0 && d < windowDays;
}

export type CooldownStatus = "cold" | "warm" | "hot";

export function getCooldownStatus(
  lastContactedAt: string | null,
): CooldownStatus {
  const days = daysSinceContact(lastContactedAt);
  if (days === null) return "cold";
  if (days >= COOLDOWN_DAYS) return "cold";
  if (days >= COOLDOWN_DAYS / 2) return "warm";
  return "hot";
}

function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Parse a YYYY-MM-DD date string in LOCAL time (avoids UTC-offset shifting the day). */
function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function isBirthdaySoon(
  birthday: string | null,
  withinDays = 7,
): boolean {
  if (!birthday) return false;
  const today = todayMidnight();
  const bday = parseDateLocal(birthday);
  const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());

  if (thisYear < today) {
    thisYear.setFullYear(thisYear.getFullYear() + 1);
  }

  const daysUntil = Math.round((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntil >= 0 && daysUntil <= withinDays;
}

export function daysUntilBirthday(birthday: string | null): number | null {
  if (!birthday) return null;
  const today = todayMidnight();
  const bday = parseDateLocal(birthday);
  const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());

  if (thisYear < today) {
    thisYear.setFullYear(thisYear.getFullYear() + 1);
  }

  return Math.round((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const WHATSAPP_PREFILL_MAX_CHARS = 1800;

/** Single default line for wa.me ?text= (no template library). */
export function defaultWhatsappPrefillText(contactName: string): string {
  const name = contactName.trim();
  const greet = name ? `Oi ${name}!` : "Oi!";
  return `${greet} Tudo certo? Queria alinhar contigo sobre o próximo rolê.`;
}

export function formatWhatsappUrl(
  whatsapp: string | null,
  options?: { prefilledText?: string | null },
): string | null {
  if (!whatsapp) return null;
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  const raw = options?.prefilledText?.trim();
  if (!raw) return base;
  const clipped =
    raw.length > WHATSAPP_PREFILL_MAX_CHARS
      ? raw.slice(0, WHATSAPP_PREFILL_MAX_CHARS)
      : raw;
  return `${base}?text=${encodeURIComponent(clipped)}`;
}

export function formatInstagramUrl(instagram: string | null): string | null {
  if (!instagram) return null;
  const trimmed = instagram.trim();
  if (trimmed.startsWith("http")) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  if (!handle) return null;
  return `https://instagram.com/${handle}`;
}
