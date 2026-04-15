import type { Contact } from "@/lib/contacts/types";
import {
  countByCooldown,
  countByRecencyBucket,
  countBySegment,
  topGenres,
  contactsWithWhatsapp,
  contactsWithInstagram,
  COOLDOWN_DAYS,
} from "@/lib/dashboard/aggregate-contacts";
import { ChartPanel } from "@/components/dashboard/chart-panel";
import { CooldownDonut } from "./cooldown-donut";
import { HorizontalBarChart } from "./horizontal-bar-chart";

type Props = {
  contacts: Contact[];
};

const SEGMENT_LABELS: Record<string, string> = {
  mailing: "Mailing",
  posta: "Posta",
  gasta_bem: "Gasta bem",
};

export function DashboardCharts({ contacts }: Props) {
  const cooldown = countByCooldown(contacts);
  const recency = countByRecencyBucket(contacts);
  const segments = countBySegment(contacts);
  const genres = topGenres(contacts, 8);
  const wa = contactsWithWhatsapp(contacts);
  const ig = contactsWithInstagram(contacts);
  const total = contacts.length;

  const recencyRows = [
    { label: "Sem registro", value: recency.never, color: "#64748b" },
    { label: "0–4 dias (quente)", value: recency["0_4"], color: "#ef4444" },
    { label: "5–9 dias (morno)", value: recency["5_9"], color: "#f59e0b" },
    { label: "10+ dias (frio / ok)", value: recency["10_plus"], color: "#10b981" },
  ];

  const segmentRows = (["mailing", "posta", "gasta_bem"] as const).map((k) => ({
    label: SEGMENT_LABELS[k],
    value: segments[k],
  }));

  const genreRows = genres.map((g) => ({
    label: g.genre,
    value: g.count,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-stretch">
        <ChartPanel
          title="Ritmo de contato"
          subtitle="Cooldown visual: verde pode chamar, amarelo recente, vermelho aguardar."
        >
          <CooldownDonut counts={cooldown} />
        </ChartPanel>

        <ChartPanel
          title="Dias desde o último contato"
          subtitle={`Referência: ${COOLDOWN_DAYS} dias para considerar “disponível” de novo.`}
        >
          <HorizontalBarChart
            rows={recencyRows}
            emptyMessage="Cadastre contatos para ver a distribuição."
          />
        </ChartPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-stretch">
        <ChartPanel
          title="Por segmento"
          subtitle="Um contato pode contar em mais de um segmento."
        >
          <HorizontalBarChart
            rows={segmentRows}
            emptyMessage="Nenhum segmento atribuído ainda."
          />
        </ChartPanel>

        <ChartPanel
          title="Top gêneros"
          subtitle="Frequência dos gêneros musicais na base."
        >
          <HorizontalBarChart
            rows={genreRows}
            emptyMessage="Nenhum gênero cadastrado ainda."
          />
        </ChartPanel>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MiniStat
          label="Com WhatsApp"
          value={wa}
          total={total}
          accent="from-emerald-500/25 to-teal-500/15"
        />
        <MiniStat
          label="Com Instagram"
          value={ig}
          total={total}
          accent="from-pink-500/25 to-violet-500/15"
        />
        <MiniStat
          label="Canais completos"
          value={contacts.filter((c) => c.whatsapp?.trim() && c.instagram?.trim()).length}
          total={total}
          accent="from-[#6c5ce7]/25 to-[#8b7cf6]/15"
        />
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  total,
  accent,
}: {
  label: string;
  value: number;
  total: number;
  accent: string;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div
      className={`dash-chart-card rounded-2xl p-5 flex flex-col justify-between min-h-[132px] bg-gradient-to-br ${accent}`}
    >
      <p className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-[var(--color-text-primary)] tabular-nums">
        {value}
        <span className="text-sm font-normal text-[var(--color-text-tertiary)] ml-1">
          / {total}
        </span>
      </p>
      <div className="h-2 rounded-full bg-[var(--color-surface-secondary)] overflow-hidden border border-[var(--color-border)]/60">
        <div
          className="h-full rounded-full bg-[var(--color-accent)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-[var(--color-text-tertiary)]">{pct}% da base</p>
    </div>
  );
}
