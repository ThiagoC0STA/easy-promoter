import * as React from "react";
import { Activity, AlertTriangle, Cake, MessageCircle, Sparkles, Users } from "lucide-react";
import type { Contact } from "@/lib/contacts/types";
import { COOLDOWN_DAYS } from "@/lib/contacts/types";
import { countContactsTouchedInRollingDays } from "@/lib/dashboard/weekly-touch-stats";
import { daysSinceContact, isBirthdaySoon, daysUntilBirthday } from "@/lib/contacts/utils";

type Props = {
  contacts: Contact[];
};

function birthdaysThisMonth(contacts: Contact[]): number {
  const now = new Date();
  const month = now.getMonth();
  return contacts.filter((c) => {
    if (!c.birthday) return false;
    const [, m] = c.birthday.split("-").map(Number);
    return (m ?? 0) - 1 === month;
  }).length;
}

function birthdaysToday(contacts: Contact[]): number {
  return contacts.filter((c) => daysUntilBirthday(c.birthday) === 0).length;
}

export function StatsCards({ contacts }: Props) {
  const total = contacts.length;
  const needsAttention = contacts.filter((c) => {
    const days = daysSinceContact(c.last_contacted_at);
    return days === null || days >= COOLDOWN_DAYS;
  }).length;
  const inCooldown = contacts.filter((c) => {
    const days = daysSinceContact(c.last_contacted_at);
    return days !== null && days < COOLDOWN_DAYS;
  }).length;
  const touchedWeek = countContactsTouchedInRollingDays(contacts, 7);
  const bdayMonth = birthdaysThisMonth(contacts);
  const bdayToday = birthdaysToday(contacts);

  const cards: {
    Icon: React.ElementType;
    label: string;
    value: number;
    sub: string;
    iconBg: string;
    iconColor: string;
    highlight?: boolean;
  }[] = [
    {
      Icon: Users,
      label: "Total",
      value: total,
      sub: "Na base",
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-400",
    },
    {
      Icon: AlertTriangle,
      label: "Para chamar",
      value: needsAttention,
      sub: needsAttention === 0 ? "Tudo em dia" : "Retomada necessária",
      iconBg: needsAttention > 0 ? "bg-red-500/15" : "bg-emerald-500/15",
      iconColor: needsAttention > 0 ? "text-red-400" : "text-emerald-400",
      highlight: needsAttention > 0,
    },
    {
      Icon: Activity,
      label: "Em cooldown",
      value: inCooldown,
      sub: `Contatados < ${COOLDOWN_DAYS}d`,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
    },
    {
      Icon: MessageCircle,
      label: "Contatos feitos",
      value: touchedWeek,
      sub: "Nos últimos 7 dias",
      iconBg: "bg-sky-500/15",
      iconColor: "text-sky-400",
    },
    {
      Icon: Cake,
      label: "Aniversários",
      value: bdayMonth,
      sub: "Neste mês",
      iconBg: "bg-pink-500/15",
      iconColor: "text-pink-400",
    },
    {
      Icon: Sparkles,
      label: "Aniversários hoje",
      value: bdayToday,
      sub: bdayToday > 0 ? "Parabéns!" : "Nenhum hoje",
      iconBg: bdayToday > 0 ? "bg-pink-500/20" : "bg-[var(--color-surface-secondary)]",
      iconColor: bdayToday > 0 ? "text-pink-400" : "text-[var(--color-text-tertiary)]",
      highlight: bdayToday > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map(({ Icon, label, value, sub, iconBg, iconColor, highlight }) => (
        <div
          key={label}
          className={`glass-card rounded-[var(--radius-card)] p-4 flex flex-col gap-3 transition-colors
            ${highlight ? "border-[var(--color-accent)]/30" : ""}`}
        >
          <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon size={17} strokeWidth={1.6} className={iconColor} />
          </div>
          <div>
            <p className="text-[1.6rem] font-bold text-[var(--color-text-primary)] leading-none tabular-nums">
              {value}
            </p>
            <p className="text-sm font-medium text-[var(--color-text-primary)] mt-1.5">
              {label}
            </p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 leading-snug">
              {sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
