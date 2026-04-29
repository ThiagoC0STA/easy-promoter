"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { Contact } from "@/lib/contacts/types";

type Props = {
  contacts: Contact[];
};

function buildMonthlyData(contacts: Contact[]) {
  const now = new Date();
  const months: { label: string; key: string; contatados: number; cadastrados: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
      .replace(".", "")
      .replace(" de ", " ");
    months.push({ label, key, contatados: 0, cadastrados: 0 });
  }

  for (const c of contacts) {
    if (c.last_contacted_at) {
      const d = new Date(c.last_contacted_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const slot = months.find((m) => m.key === key);
      if (slot) slot.contatados++;
    }
    if (c.created_at) {
      const d = new Date(c.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const slot = months.find((m) => m.key === key);
      if (slot) slot.cadastrados++;
    }
  }

  return months;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2.5 shadow-lg text-xs min-w-[140px]">
      <p className="text-[var(--color-text-tertiary)] mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-[var(--color-text-secondary)]">{p.name}</span>
          </span>
          <span className="font-semibold text-[var(--color-text-primary)]">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: { payload?: { value: string; color: string }[] }) {
  if (!payload?.length) return null;
  return (
    <div className="flex items-center justify-end gap-4 mt-3">
      {payload.map((p) => (
        <span key={p.value} className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
          <span className="w-2.5 h-0.5 rounded-full inline-block" style={{ background: p.color }} />
          {p.value}
        </span>
      ))}
    </div>
  );
}

export function MonthlyTouchesChart({ contacts }: Props) {
  const data = buildMonthlyData(contacts);
  const hasData = data.some((d) => d.contatados > 0 || d.cadastrados > 0);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  return (
    <div className="glass-card rounded-[var(--radius-card)] p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Atividade nos últimos 12 meses
        </h2>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
          Contatos feitos e novos cadastros por mês
        </p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-48 text-sm text-[var(--color-text-secondary)]">
          Nenhuma atividade registrada ainda.
        </div>
      ) : !mounted ? (
        <div className="h-56 sm:h-64 -mx-2" aria-hidden />
      ) : (
        <div className="h-56 sm:h-64 -mx-2">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={data} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="color-mix(in srgb, currentColor 8%, transparent)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }} />
              <Legend content={<CustomLegend />} />
              <Line
                type="monotone"
                dataKey="contatados"
                name="Contatados"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="cadastrados"
                name="Cadastrados"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 3"
                activeDot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
