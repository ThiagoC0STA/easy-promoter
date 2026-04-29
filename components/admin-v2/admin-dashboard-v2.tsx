"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ChevronRight,
  Crown,
  Plus,
  ScrollText,
  Shield,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { AdminAddUserTabs } from "@/components/admin/admin-add-user-tabs";
import type { PromoterStat, TeamActivity } from "@/lib/admin/queries";

type Props = {
  stats: PromoterStat[];
  activity: TeamActivity;
  currentUserId: string;
};

const PANEL_BG = "var(--ps-panel)";
const PANEL_BG_2 = "var(--ps-panel-2)";
const LINE = "var(--ps-line)";
const LINE_2 = "var(--ps-line-2)";
const INK = "var(--ps-ink)";
const INK_2 = "var(--ps-ink-2)";
const INK_3 = "var(--ps-ink-3)";
const ACCENT = "var(--ps-accent)";
const ACCENT_2 = "var(--ps-accent-2)";
const GREEN = "var(--ps-green)";
const AMBER = "var(--ps-amber)";
const CYAN = "var(--ps-cyan)";

export function AdminDashboardV2({ stats, activity, currentUserId }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const totals = React.useMemo(() => {
    const promoters = stats.length;
    const totalContacts = stats.reduce((s, p) => s + p.total_contacts, 0);
    const touched30d = stats.reduce((s, p) => s + p.touched_last_30d, 0);
    const wa = stats.reduce((s, p) => s + p.contacts_with_whatsapp, 0);
    const waCoverage = totalContacts > 0 ? wa / totalContacts : 0;
    const activePromoters = stats.filter((p) => p.touched_last_30d > 0).length;
    return { promoters, activePromoters, totalContacts, touched30d, waCoverage };
  }, [stats]);

  const maxContacts = React.useMemo(
    () => Math.max(1, ...stats.map((s) => s.total_contacts)),
    [stats],
  );
  const maxTouches = React.useMemo(
    () => Math.max(1, ...stats.map((s) => s.touched_last_30d)),
    [stats],
  );

  const top3 = stats.slice(0, 3);

  async function handleDelete(p: PromoterStat) {
    const label = p.display_name ?? p.promoter_id;
    if (
      !confirm(
        `Deletar "${label}"? Todos os contatos dele serão removidos. Essa ação é irreversível.`,
      )
    )
      return;
    setDeletingId(p.promoter_id);
    try {
      const res = await fetch(`/api/admin/users/${p.promoter_id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) {
        alert(json.error ?? "Erro ao deletar usuário.");
        return;
      }
      router.refresh();
    } catch {
      alert("Erro de rede. Tente de novo.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="ps-page">
      <div className="ps-page-head">
        <div>
          <h1 className="ps-page-h1">Operação</h1>
          <p className="ps-page-sub">
            Equipe, performance da base e novos acessos.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/admin/changelog" className="ps-tb-btn outline" style={{ textDecoration: "none" }}>
            <ScrollText size={13} strokeWidth={1.75} />
            Changelog
          </Link>
          <Link href="/admin/health" className="ps-tb-btn outline" style={{ textDecoration: "none" }}>
            <Activity size={13} strokeWidth={1.75} />
            Saúde
          </Link>
          <button type="button" className="ps-tb-btn primary" onClick={() => setAddOpen((v) => !v)}>
            <Plus size={13} strokeWidth={2} />
            Novo usuário
          </button>
        </div>
      </div>

      {addOpen && (
        <div style={{ background: PANEL_BG, border: `1px solid ${LINE}`, borderRadius: 10, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: INK }}>Adicionar usuário</div>
              <div style={{ fontSize: 12, color: INK_3, marginTop: 4 }}>
                Crie diretamente com senha provisória ou envie um link de convite.
              </div>
            </div>
            <button type="button" className="ps-icon-btn" onClick={() => setAddOpen(false)} aria-label="Fechar">
              ×
            </button>
          </div>
          <AdminAddUserTabs />
        </div>
      )}

      <div className="ps-stat-strip">
        <AdminStat icon={<Users size={11} strokeWidth={1.75} />} label="Promoters" value={totals.promoters} sub={`${totals.activePromoters} ativos no mês`} />
        <AdminStat icon={<Zap size={11} strokeWidth={1.75} />} label="Toques 30d" value={totals.touched30d} sub={totals.promoters > 0 ? `${(totals.touched30d / totals.promoters).toFixed(1)} por promoter` : "—"} />
        <AdminStat icon={<Users size={11} strokeWidth={1.75} />} label="Base total" value={totals.totalContacts} sub={totals.promoters > 0 ? `${Math.round(totals.totalContacts / totals.promoters)} por promoter` : "—"} />
        <AdminStat icon={<Activity size={11} strokeWidth={1.75} />} label="Cobertura WA" value={`${Math.round(totals.waCoverage * 100)}%`} sub="dos contatos têm WhatsApp" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
        <ChartCard title="Toques da equipe" subtitle="Últimos 30 dias">
          <BarChart values={activity.daily30} />
        </ChartCard>
        <ChartCard title="Distribuição da base" subtitle="Por segmento">
          <SegmentDonut breakdown={activity.segmentBreakdown} total={totals.totalContacts} />
        </ChartCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <RiskCard tone="warn" label="Pra resgatar" value={activity.rescueCount} sub="contatos frios há 30+ dias" />
        <RiskCard tone="info" label="Novos sem toque" value={activity.newCount} sub="ainda não falaram" />
        <RiskCard tone="good" label="Em ritmo" value={Math.max(0, totals.totalContacts - activity.rescueCount - activity.newCount)} sub="contatos ativos" />
      </div>

      {top3.length > 0 && (
        <div>
          <SectionTitle title="Pódio" subtitle="top 3 por toques no mês" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {top3.map((p, i) => (
              <PodiumCard key={p.promoter_id} stat={p} rank={i + 1} maxTouches={maxTouches} />
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
        <div>
          <SectionTitle title="Equipe" subtitle={`${stats.length} ${stats.length === 1 ? "promoter" : "promoters"} · ordenado por base`} />
          <div style={{ background: PANEL_BG, border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "44px minmax(180px, 1.6fr) 110px 130px 100px 60px",
                gap: 14,
                padding: "10px 18px",
                fontSize: 11,
                fontWeight: 600,
                color: INK_3,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                background: PANEL_BG_2,
                borderBottom: `1px solid ${LINE}`,
              }}
            >
              <span></span>
              <span>Promoter</span>
              <span>Base</span>
              <span>Toques 30d</span>
              <span>WA · IG</span>
              <span></span>
            </div>
            {stats.map((p, i) => (
              <PromoterRow
                key={p.promoter_id}
                stat={p}
                index={i}
                isMe={p.promoter_id === currentUserId}
                maxContacts={maxContacts}
                maxTouches={maxTouches}
                busy={deletingId === p.promoter_id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        <div>
          <SectionTitle title="Atividade recente" subtitle="últimos 10 toques" />
          <ActivityFeed items={activity.recent} />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: INK, letterSpacing: "-0.015em", margin: 0 }}>
        {title}
      </h2>
      {subtitle && <span style={{ fontSize: 12, color: INK_3 }}>{subtitle}</span>}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: PANEL_BG,
        border: `1px solid ${LINE}`,
        borderRadius: 10,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: INK, letterSpacing: "-0.01em" }}>
          {title}
        </div>
        {subtitle && <div style={{ fontSize: 12, color: INK_3, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function BarChart({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120, padding: "0 2px" }}>
        {values.map((v, i) => {
          const isToday = i === values.length - 1;
          const h = Math.max(2, (v / max) * 100);
          return (
            <div
              key={i}
              title={`Dia -${values.length - 1 - i}: ${v} toques`}
              style={{
                flex: 1,
                height: `${h}%`,
                minWidth: 0,
                background: isToday
                  ? `linear-gradient(180deg, ${ACCENT_2}, ${ACCENT})`
                  : v > 0
                    ? `color-mix(in srgb, ${ACCENT} 38%, transparent)`
                    : LINE_2,
                borderRadius: 3,
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: INK_3, fontFamily: "var(--font-geist-mono)", letterSpacing: "0.04em" }}>
        <span>30d atrás</span>
        <span>15d</span>
        <span>hoje</span>
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 12, color: INK_3 }}>
        <span><span style={{ color: INK, fontWeight: 600 }}>{values.reduce((s, v) => s + v, 0)}</span> total</span>
        <span>·</span>
        <span><span style={{ color: INK, fontWeight: 600 }}>{values[values.length - 1]}</span> hoje</span>
        <span>·</span>
        <span><span style={{ color: INK, fontWeight: 600 }}>{Math.max(...values)}</span> pico</span>
      </div>
    </div>
  );
}

function SegmentDonut({
  breakdown,
  total,
}: {
  breakdown: Array<{ key: string; label: string; count: number }>;
  total: number;
}) {
  const colors = [ACCENT_2, CYAN, AMBER, GREEN, "#f472b6"];
  const totalSeg = breakdown.reduce((s, b) => s + b.count, 0);
  const denominator = Math.max(totalSeg, 1);

  let acc = 0;
  const r = 38;
  const c = 2 * Math.PI * r;
  const segments = breakdown.map((b, i) => {
    const frac = b.count / denominator;
    const dash = c * frac;
    const seg = {
      key: b.key,
      label: b.label,
      count: b.count,
      color: colors[i % colors.length],
      offset: -acc * c,
      dash,
    };
    acc += frac;
    return seg;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <svg width={104} height={104} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <circle cx={50} cy={50} r={r} fill="none" stroke={LINE} strokeWidth={10} />
        {segments.map((s) => (
          <circle
            key={s.key}
            cx={50}
            cy={50}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={10}
            strokeDasharray={`${s.dash} ${c - s.dash}`}
            strokeDashoffset={s.offset}
            transform="rotate(-90 50 50)"
          />
        ))}
        <text
          x={50}
          y={48}
          textAnchor="middle"
          fontSize={18}
          fontWeight={700}
          fill={INK}
          fontFamily="var(--font-geist-sans)"
          style={{ letterSpacing: "-0.03em" }}
        >
          {total}
        </text>
        <text x={50} y={62} textAnchor="middle" fontSize={9} fill={INK_3}>
          contatos
        </text>
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        {segments.length === 0 ? (
          <span style={{ fontSize: 12, color: INK_3 }}>Nenhum segmento.</span>
        ) : (
          segments.map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ color: INK_2, flex: 1 }}>{s.label}</span>
              <span className="mono" style={{ color: INK }}>{s.count}</span>
              <span className="mono" style={{ color: INK_3, fontSize: 11 }}>
                {Math.round((s.count / denominator) * 100)}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RiskCard({
  tone,
  label,
  value,
  sub,
}: {
  tone: "warn" | "info" | "good";
  label: string;
  value: number;
  sub: string;
}) {
  const color = tone === "warn" ? AMBER : tone === "good" ? GREEN : ACCENT_2;
  return (
    <div
      style={{
        background: PANEL_BG,
        border: `1px solid ${LINE}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 10,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: INK_3, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 13, color: INK_3, marginTop: 2 }}>{sub}</div>
      </div>
      <div
        className="mono"
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: INK,
          letterSpacing: "-0.03em",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActivityFeed({
  items,
}: {
  items: Array<{
    contact_name: string;
    promoter_name: string;
    when: string;
    days_ago: number;
  }>;
}) {
  if (items.length === 0) {
    return (
      <div
        style={{
          background: PANEL_BG,
          border: `1px solid ${LINE}`,
          borderRadius: 10,
          padding: 32,
          textAlign: "center",
          color: INK_3,
          fontSize: 13,
        }}
      >
        Nenhum toque registrado ainda.
      </div>
    );
  }
  return (
    <div style={{ background: PANEL_BG, border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
      {items.map((it, i) => {
        const when =
          it.days_ago === 0
            ? "hoje"
            : it.days_ago === 1
              ? "ontem"
              : `há ${it.days_ago}d`;
        return (
          <div
            key={`${it.contact_name}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderBottom: i < items.length - 1 ? `1px solid ${LINE}` : "none",
            }}
          >
            <div className="ps-avatar sm" style={{ width: 26, height: 26, fontSize: 10, flexShrink: 0 }}>
              {initialsOf(it.promoter_name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: INK, lineHeight: 1.3 }}>
                <span style={{ fontWeight: 500 }}>{it.promoter_name}</span>
                <span style={{ color: INK_3, fontWeight: 400 }}> falou com </span>
                <span style={{ fontWeight: 500 }}>{it.contact_name}</span>
              </div>
              <div className="mono" style={{ fontSize: 11, color: INK_3, marginTop: 2 }}>
                {when}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminStat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
}) {
  return (
    <div className="ps-stat-cell">
      <div className="lbl">
        {icon}
        {label}
      </div>
      <div className="ps-stat-row">
        <div className="val">{value}</div>
      </div>
      <div className="sub">
        <span>{sub}</span>
      </div>
    </div>
  );
}

function PodiumCard({
  stat,
  rank,
  maxTouches,
}: {
  stat: PromoterStat;
  rank: number;
  maxTouches: number;
}) {
  const initials = initialsOf(stat.display_name ?? "?");
  const pct = Math.max(2, Math.round((stat.touched_last_30d / maxTouches) * 100));
  const accent = rank === 1 ? AMBER : rank === 2 ? INK_2 : CYAN;
  return (
    <div
      style={{
        background: PANEL_BG,
        border: `1px solid ${LINE}`,
        borderRadius: 10,
        padding: "18px 20px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: accent,
        }}
      >
        {rank === 1 && <Crown size={14} strokeWidth={2} />}
        <span className="mono">#{rank}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
        <div className="ps-avatar lg">{initials}</div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: INK,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {stat.display_name ?? "Sem nome"}
          </div>
          <div style={{ fontSize: 12, color: INK_3 }}>
            {stat.role === "super_admin" ? "Super admin" : "Promoter"}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 16 }}>
        <span
          className="mono"
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: INK,
            letterSpacing: "-0.03em",
          }}
        >
          {stat.touched_last_30d}
        </span>
        <span style={{ fontSize: 12, color: INK_3 }}>toques 30d</span>
      </div>
      <div
        style={{
          height: 4,
          background: LINE,
          borderRadius: 999,
          overflow: "hidden",
          marginTop: 8,
        }}
      >
        <div style={{ width: `${pct}%`, background: accent, height: "100%", opacity: 0.6 }} />
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 12, color: INK_3 }}>
        <span>{stat.total_contacts} contatos</span>
        <span>·</span>
        <span>{stat.contacts_with_whatsapp} c/ WA</span>
      </div>
    </div>
  );
}

function PromoterRow({
  stat,
  index,
  isMe,
  maxContacts,
  maxTouches,
  busy,
  onDelete,
}: {
  stat: PromoterStat;
  index: number;
  isMe: boolean;
  maxContacts: number;
  maxTouches: number;
  busy: boolean;
  onDelete: (p: PromoterStat) => void;
}) {
  const router = useRouter();
  const initials = initialsOf(stat.display_name ?? "?");
  const contactsPct = Math.max(2, Math.round((stat.total_contacts / maxContacts) * 100));
  const touchesPct = Math.max(2, Math.round((stat.touched_last_30d / maxTouches) * 100));
  const waPct = stat.total_contacts > 0 ? Math.round((stat.contacts_with_whatsapp / stat.total_contacts) * 100) : 0;
  const igPct = stat.total_contacts > 0 ? Math.round((stat.contacts_with_instagram / stat.total_contacts) * 100) : 0;

  return (
    <div
      onClick={() => router.push(`/admin/promoters/${stat.promoter_id}`)}
      style={{
        display: "grid",
        gridTemplateColumns: "44px minmax(180px, 1.6fr) 110px 130px 100px 60px",
        gap: 14,
        padding: "12px 18px",
        alignItems: "center",
        borderBottom: `1px solid ${LINE}`,
        cursor: "pointer",
        transition: "background .12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ps-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span
        className="mono"
        style={{ fontSize: 12, color: INK_3, fontWeight: 500, textAlign: "center" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div className="ps-avatar sm">{initials}</div>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, lineHeight: 1.25 }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 500,
              color: INK,
              letterSpacing: "-0.005em",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {stat.display_name ?? "Sem nome"}
            </span>
            {isMe && <span className="ps-pill-me">Você</span>}
            {stat.role === "super_admin" && (
              <Shield size={11} strokeWidth={2} style={{ color: AMBER }} />
            )}
          </span>
          <span style={{ fontSize: 12, color: INK_3 }}>
            {stat.role === "super_admin" ? "super admin" : "promoter"}
          </span>
        </div>
      </div>

      <CellBar value={stat.total_contacts} pct={contactsPct} color={ACCENT_2} />
      <CellBar value={stat.touched_last_30d} pct={touchesPct} color={GREEN} />

      <div className="mono" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
        <span style={{ color: INK_2 }}>{waPct}%</span>
        <span style={{ opacity: 0.4, color: INK_3 }}>/</span>
        <span style={{ color: INK_2 }}>{igPct}%</span>
      </div>

      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
        <Link href={`/admin/promoters/${stat.promoter_id}`} className="ps-icon-btn" title="Abrir">
          <ChevronRight size={14} strokeWidth={1.75} />
        </Link>
        {!isMe && (
          <button
            type="button"
            className="ps-icon-btn"
            disabled={busy}
            title="Deletar"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(stat);
            }}
          >
            <Trash2 size={13} strokeWidth={1.75} />
          </button>
        )}
      </div>
    </div>
  );
}

function CellBar({ value, pct, color }: { value: number; pct: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span className="mono" style={{ fontSize: 13, color: INK, fontWeight: 500 }}>
        {value}
      </span>
      <div style={{ height: 3, background: LINE, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
