import { Activity, Cake, MessageCircle, Users } from "lucide-react";
import type { Contact } from "@/lib/contacts/types";
import { COOLDOWN_DAYS } from "@/lib/contacts/types";
import { countContactsTouchedInRollingDays } from "@/lib/dashboard/weekly-touch-stats";
import { daysSinceContact, isBirthdaySoon } from "@/lib/contacts/utils";

type Props = {
  contacts: Contact[];
};

export function StatsCards({ contacts }: Props) {
  const total = contacts.length;
  const birthdays = contacts.filter((c) => isBirthdaySoon(c.birthday)).length;
  const needsAttention = contacts.filter((c) => {
    const days = daysSinceContact(c.last_contacted_at);
    return days === null || days >= COOLDOWN_DAYS;
  }).length;

  const touchedWeek = countContactsTouchedInRollingDays(contacts, 7);

  const cards = [
    {
      Icon: Users,
      label: "Total",
      value: total,
      gradient:
        "from-[color-mix(in_srgb,var(--color-chart-violet)_22%,transparent)] to-[color-mix(in_srgb,var(--color-accent)_14%,transparent)]",
      iconColor: "text-[var(--color-chart-violet)]",
      hint: null as string | null,
    },
    {
      Icon: Cake,
      label: "Aniversários",
      value: birthdays,
      gradient:
        "from-[color-mix(in_srgb,var(--color-chart-rose)_22%,transparent)] to-[color-mix(in_srgb,var(--color-accent-light)_12%,transparent)]",
      iconColor: "text-[var(--color-chart-rose)]",
      hint: null as string | null,
    },
    {
      Icon: Activity,
      label: "Para chamar",
      value: needsAttention,
      gradient:
        "from-[color-mix(in_srgb,var(--color-chart-emerald)_22%,transparent)] to-[color-mix(in_srgb,var(--color-chart-sky)_12%,transparent)]",
      iconColor: "text-[var(--color-chart-emerald)]",
      hint: null as string | null,
    },
    {
      Icon: MessageCircle,
      label: "Toques em 7 dias",
      value: touchedWeek,
      gradient:
        "from-[color-mix(in_srgb,var(--color-chart-sky)_22%,transparent)] to-[color-mix(in_srgb,var(--color-chart-violet)_10%,transparent)]",
      iconColor: "text-[var(--color-chart-sky)]",
      hint: "Último contato registrado nos últimos 7 dias.",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ Icon, label, value, gradient, iconColor, hint }) => (
        <div
          key={label}
          className="glass-card rounded-[var(--radius-card)] p-5 flex items-center gap-4"
        >
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}
          >
            <Icon size={20} strokeWidth={1.5} className={iconColor} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)] leading-none">
              {value}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              {label}
              {hint ? (
                <span className="block text-[10px] font-normal mt-0.5 opacity-90">{hint}</span>
              ) : null}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
