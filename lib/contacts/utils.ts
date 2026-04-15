import { COOLDOWN_DAYS } from "./types";

export function daysSinceContact(lastContactedAt: string | null): number | null {
  if (!lastContactedAt) return null;
  const diff = Date.now() - new Date(lastContactedAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
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

export function isBirthdaySoon(
  birthday: string | null,
  withinDays = 7,
): boolean {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  const thisYear = new Date(
    today.getFullYear(),
    bday.getMonth(),
    bday.getDate(),
  );

  if (thisYear < today) {
    thisYear.setFullYear(thisYear.getFullYear() + 1);
  }

  const diff = thisYear.getTime() - today.getTime();
  const daysUntil = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return daysUntil >= 0 && daysUntil <= withinDays;
}

export function daysUntilBirthday(birthday: string | null): number | null {
  if (!birthday) return null;
  const today = new Date();
  const bday = new Date(birthday);
  const thisYear = new Date(
    today.getFullYear(),
    bday.getMonth(),
    bday.getDate(),
  );

  if (thisYear < today) {
    thisYear.setFullYear(thisYear.getFullYear() + 1);
  }

  return Math.ceil((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatWhatsappUrl(whatsapp: string | null): string | null {
  if (!whatsapp) return null;
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export function formatInstagramUrl(instagram: string | null): string | null {
  if (!instagram) return null;
  const trimmed = instagram.trim();
  if (trimmed.startsWith("http")) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  if (!handle) return null;
  return `https://instagram.com/${handle}`;
}
