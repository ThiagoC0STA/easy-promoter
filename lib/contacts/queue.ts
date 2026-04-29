import type { Contact } from "@/lib/contacts/types";
import {
  daysSinceContact,
  daysUntilBirthday,
} from "@/lib/contacts/utils";

export type Priority = "urgent" | "high" | "med" | "low";
export type StatusKind = "hot" | "warm" | "cold" | "bday" | "done" | "new";

export type EnrichedContact = Contact & {
  daysSince: number | null;
  bdayIn: number | null;
  priority: Priority;
  status: StatusKind;
  hint: string;
  isDoneToday: boolean;
};

const BIRTHDAY_WINDOW_DAYS = 14;

function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function isTouchedToday(lastContactedAt: string | null): boolean {
  if (!lastContactedAt) return false;
  return lastContactedAt >= startOfTodayISO();
}

export function derivePriority(
  daysSince: number | null,
  bdayIn: number | null,
): Priority {
  if (bdayIn !== null && bdayIn <= 3) return "urgent";
  if (daysSince === null) return "high";
  if (daysSince >= 30) return "urgent";
  if (daysSince >= 14) return "high";
  if (bdayIn !== null && bdayIn <= 7) return "high";
  if (daysSince >= 7) return "med";
  return "low";
}

export function deriveStatus(
  daysSince: number | null,
  bdayIn: number | null,
  isDoneToday: boolean,
): StatusKind {
  if (isDoneToday) return "done";
  if (bdayIn !== null && bdayIn <= BIRTHDAY_WINDOW_DAYS) return "bday";
  if (daysSince === null) return "new";
  if (daysSince >= 30) return "cold";
  if (daysSince >= 14) return "warm";
  return "hot";
}

export function approachHint(c: {
  daysSince: number | null;
  bdayIn: number | null;
}): string {
  if (c.bdayIn !== null && c.bdayIn === 0) return "Aniversário hoje — parabenizar";
  if (c.bdayIn !== null && c.bdayIn <= 3) return `Aniversário em ${c.bdayIn}d — convite VIP`;
  if (c.bdayIn !== null && c.bdayIn <= 7) return "Aniversário próximo — manda parabéns";
  if (c.daysSince === null) return "Primeiro contato — apresente a casa";
  if (c.daysSince >= 30) return "Resgate — faz tempo demais";
  if (c.daysSince >= 14) return "Reaqueça com a próxima data forte";
  if (c.daysSince >= 7) return "Confirma presença na próxima";
  return "Em ritmo — manter contato";
}

export function priorityLabel(p: Priority): string {
  switch (p) {
    case "urgent":
      return "Urgente";
    case "high":
      return "Alta";
    case "med":
      return "Média";
    case "low":
      return "Baixa";
  }
}

export function statusLabel(s: StatusKind): string {
  switch (s) {
    case "hot":
      return "Quente";
    case "warm":
      return "Morno";
    case "cold":
      return "Frio";
    case "bday":
      return "Aniversário";
    case "done":
      return "Feito hoje";
    case "new":
      return "Novo";
  }
}

const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  med: 2,
  low: 3,
};

export function enrich(contact: Contact): EnrichedContact {
  const daysSince = daysSinceContact(contact.last_contacted_at);
  const bdayIn = daysUntilBirthday(contact.birthday);
  const isDoneToday = isTouchedToday(contact.last_contacted_at);
  const priority = derivePriority(daysSince, bdayIn);
  const status = deriveStatus(daysSince, bdayIn, isDoneToday);
  return {
    ...contact,
    daysSince,
    bdayIn,
    priority,
    status,
    hint: approachHint({ daysSince, bdayIn }),
    isDoneToday,
  };
}

export type QueueBucket = "queue" | "birthdays" | "rescue" | "done";

export function bucketOf(c: EnrichedContact): QueueBucket | null {
  if (c.isDoneToday) return "done";
  if (c.bdayIn !== null && c.bdayIn <= BIRTHDAY_WINDOW_DAYS) return "birthdays";
  if (c.daysSince !== null && c.daysSince >= 30) return "rescue";
  if (c.priority === "urgent" || c.priority === "high" || c.priority === "med")
    return "queue";
  return null;
}

export function sortByPriority(a: EnrichedContact, b: EnrichedContact): number {
  const pa = PRIORITY_ORDER[a.priority];
  const pb = PRIORITY_ORDER[b.priority];
  if (pa !== pb) return pa - pb;
  if (a.bdayIn !== null && b.bdayIn !== null) return a.bdayIn - b.bdayIn;
  if (a.bdayIn !== null) return -1;
  if (b.bdayIn !== null) return 1;
  const ad = a.daysSince ?? -1;
  const bd = b.daysSince ?? -1;
  return bd - ad;
}

function dayStartUTC(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/**
 * Number of consecutive days (ending today) where at least 1 contact was touched.
 * 0 if today has no touches yet.
 */
export function touchStreak(contacts: Contact[]): number {
  const days = new Set<number>();
  for (const c of contacts) {
    if (!c.last_contacted_at) continue;
    days.add(dayStartUTC(new Date(c.last_contacted_at)));
  }
  if (days.size === 0) return 0;
  const today = dayStartUTC(new Date());
  let streak = 0;
  let cursor = today;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 24 * 60 * 60 * 1000;
  }
  return streak;
}

/**
 * Last `days` daily touch counts (oldest -> newest, length = days).
 */
export function dailyTouchSeries(contacts: Contact[], days = 14): number[] {
  const today = dayStartUTC(new Date());
  const buckets = new Array(days).fill(0) as number[];
  for (const c of contacts) {
    if (!c.last_contacted_at) continue;
    const d = dayStartUTC(new Date(c.last_contacted_at));
    const offset = Math.floor((today - d) / (24 * 60 * 60 * 1000));
    if (offset >= 0 && offset < days) {
      buckets[days - 1 - offset] += 1;
    }
  }
  return buckets;
}

export type Insight = {
  id: string;
  text: string;
  tone: "info" | "warn" | "good";
};

export function getInsights(input: {
  all: EnrichedContact[];
  queue: EnrichedContact[];
  birthdays: EnrichedContact[];
  rescue: EnrichedContact[];
  done: EnrichedContact[];
  streak: number;
}): Insight[] {
  const { all, queue, birthdays, rescue, done, streak } = input;
  const insights: Insight[] = [];

  if (streak >= 3) {
    insights.push({
      id: "streak",
      text: `🔥 ${streak} dias seguidos com pelo menos 1 toque. Não quebra a sequência hoje.`,
      tone: "good",
    });
  }

  const newOnes = all.filter((c) => c.daysSince === null).length;
  if (newOnes > 0) {
    insights.push({
      id: "new",
      text: `Você ainda nunca falou com ${newOnes} ${newOnes === 1 ? "contato" : "contatos"}. Comece por aí.`,
      tone: "info",
    });
  }

  const vipColdCount = all.filter(
    (c) =>
      c.segments?.includes("gasta_bem") &&
      c.daysSince !== null &&
      c.daysSince >= 14,
  ).length;
  if (vipColdCount > 0) {
    insights.push({
      id: "vip-cold",
      text: `${vipColdCount} ${vipColdCount === 1 ? "VIP está" : "VIPs estão"} sem contato há 14+ dias. Resgate prioritário.`,
      tone: "warn",
    });
  }

  const todayBday = birthdays.filter((c) => c.bdayIn === 0).length;
  if (todayBday > 0) {
    insights.push({
      id: "bday-today",
      text: `🎂 ${todayBday} ${todayBday === 1 ? "aniversário" : "aniversários"} hoje. Mensagem cedo rende mais.`,
      tone: "good",
    });
  }

  if (rescue.length >= 5) {
    insights.push({
      id: "rescue",
      text: `${rescue.length} contatos frios há 30+ dias. Considere uma onda de resgate.`,
      tone: "warn",
    });
  }

  if (queue.length === 0 && done.length > 0) {
    insights.push({
      id: "clear",
      text: `Tudo em dia. Você fechou ${done.length} ${done.length === 1 ? "contato" : "contatos"} hoje.`,
      tone: "good",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "empty",
      text: "Sua base está silenciosa. Adicione contatos pra a fila começar a respirar.",
      tone: "info",
    });
  }

  return insights;
}

export function buildBuckets(contacts: Contact[]) {
  const enriched = contacts.map(enrich);
  const queue: EnrichedContact[] = [];
  const birthdays: EnrichedContact[] = [];
  const rescue: EnrichedContact[] = [];
  const done: EnrichedContact[] = [];

  for (const c of enriched) {
    const b = bucketOf(c);
    if (b === "queue") queue.push(c);
    else if (b === "birthdays") birthdays.push(c);
    else if (b === "rescue") rescue.push(c);
    else if (b === "done") done.push(c);
  }

  queue.sort(sortByPriority);
  birthdays.sort((a, b) => (a.bdayIn ?? 999) - (b.bdayIn ?? 999));
  rescue.sort((a, b) => (b.daysSince ?? 0) - (a.daysSince ?? 0));
  done.sort((a, b) => {
    const at = a.last_contacted_at ?? "";
    const bt = b.last_contacted_at ?? "";
    return bt.localeCompare(at);
  });

  return { all: enriched, queue, birthdays, rescue, done };
}
