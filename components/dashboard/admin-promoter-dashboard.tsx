import { Cake, Clock } from "lucide-react";
import type { Contact } from "@/lib/contacts/types";
import { COOLDOWN_DAYS } from "@/lib/contacts/types";
import { StatsCards } from "@/components/contacts/stats-cards";
import { MonthlyTouchesChart } from "@/components/dashboard/monthly-touches-chart";
import { daysSinceContact, isBirthdaySoon, daysUntilBirthday } from "@/lib/contacts/utils";

type Props = {
  contacts: Contact[];
};

function needsAttention(c: Contact) {
  const d = daysSinceContact(c.last_contacted_at);
  return d === null || d >= COOLDOWN_DAYS;
}

export function AdminPromoterDashboard({ contacts }: Props) {
  const priority = [...contacts.filter(needsAttention)]
    .sort((a, b) => {
      const da = daysSinceContact(a.last_contacted_at);
      const db = daysSinceContact(b.last_contacted_at);
      if (da === null && db === null) return 0;
      if (da === null) return -1;
      if (db === null) return 1;
      return db - da;
    })
    .slice(0, 8);

  const birthdays = contacts
    .filter((c) => isBirthdaySoon(c.birthday))
    .sort((a, b) => (daysUntilBirthday(a.birthday) ?? 999) - (daysUntilBirthday(b.birthday) ?? 999))
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-8">
      <StatsCards contacts={contacts} />
      <MonthlyTouchesChart contacts={contacts} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
              <Clock size={13} strokeWidth={1.75} className="text-red-400" />
            </div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Prioridade</h2>
          </div>
          {priority.length === 0 ? (
            <div className="glass-card rounded-[var(--radius-card)] p-8 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">Tudo em dia.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {priority.map((c) => {
                const days = daysSinceContact(c.last_contacted_at);
                return (
                  <li key={c.id} className="glass-card rounded-[var(--radius-control)] px-4 py-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{c.name}</span>
                    <span className="text-xs text-red-400 shrink-0 font-medium">
                      {days === null ? "Nunca" : `${days}d sem contato`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-pink-500/15 flex items-center justify-center">
              <Cake size={13} strokeWidth={1.75} className="text-pink-400" />
            </div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Aniversários (7 dias)</h2>
          </div>
          {birthdays.length === 0 ? (
            <div className="glass-card rounded-[var(--radius-card)] p-8 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">Nenhum aniversário nesta janela.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {birthdays.map((c) => {
                const d = daysUntilBirthday(c.birthday);
                return (
                  <li key={c.id} className="glass-card rounded-[var(--radius-control)] px-4 py-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{c.name}</span>
                    <span className={`text-xs font-semibold shrink-0 ${d === 0 ? "text-pink-400" : "text-[var(--color-text-tertiary)]"}`}>
                      {d === 0 ? "Hoje" : `Em ${d}d`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
