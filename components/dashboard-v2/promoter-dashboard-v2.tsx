"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Cake,
  Edit,
  Filter,
  Flame,
  Sparkles,
  Target,
  Users,
  X,
  Zap,
} from "lucide-react";
import { WhatsAppGlyph } from "@/components/icons/whatsapp-glyph";
import { InstagramGlyph } from "@/components/icons/instagram-glyph";
import { ChannelTouchLauncher } from "@/components/contacts/channel-touch-launcher";
import { EditContactSheet } from "@/components/contacts/edit-contact-sheet";
import { MonthlyTouchesChart } from "@/components/dashboard/monthly-touches-chart";
import {
  formatInstagramUrl,
  formatWhatsappUrl,
} from "@/lib/contacts/utils";
import { touchContactByIdAction } from "@/lib/contacts/actions";
import type { Contact } from "@/lib/contacts/types";
import {
  type EnrichedContact,
  type Insight,
  priorityLabel,
  type Priority,
  statusLabel,
} from "@/lib/contacts/queue";

type Tab = "queue" | "birthdays" | "rescue" | "done";
type FocusPreset = "all" | "vip-cold" | "birthdays";

type Props = {
  queue: EnrichedContact[];
  birthdays: EnrichedContact[];
  rescue: EnrichedContact[];
  done: EnrichedContact[];
  contacts: Contact[];
  totalContacts: number;
  touches7d: number;
  series14: number[];
  streak: number;
  insights: Insight[];
};

export function PromoterDashboardV2({
  queue,
  birthdays,
  rescue,
  done,
  contacts,
  totalContacts,
  touches7d,
  series14,
  streak,
  insights,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = React.useState<Tab>("queue");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [insightIdx, setInsightIdx] = React.useState(0);

  React.useEffect(() => {
    if (insights.length <= 1) return;
    const id = setInterval(() => {
      setInsightIdx((i) => (i + 1) % insights.length);
    }, 6000);
    return () => clearInterval(id);
  }, [insights.length]);

  function openFocus(preset: FocusPreset) {
    window.dispatchEvent(
      new CustomEvent("ep:open-focus", { detail: { preset } }),
    );
  }

  async function markDone(c: EnrichedContact) {
    if (busyId) return;
    setBusyId(c.id);
    try {
      const res = await touchContactByIdAction(c.id);
      if (!res.ok) {
        alert(res.message);
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const list =
    tab === "queue"
      ? queue
      : tab === "birthdays"
        ? birthdays
        : tab === "rescue"
          ? rescue
          : done;

  return (
    <div className="ps-page">
      <div className="ps-page-head">
        <div>
          <h1 className="ps-page-h1">Hoje</h1>
          <p className="ps-page-sub">
            Sua fila do dia, aniversários e contatos pra resgatar.
          </p>
        </div>
        {streak > 0 && (
          <div className={`ps-streak ${streak >= 7 ? "hot" : ""}`} title={`Sequência de ${streak} dia${streak === 1 ? "" : "s"} com toques`}>
            <span className="emoji">🔥</span>
            <span className="num mono">{streak}</span>
            <span className="lbl">{streak === 1 ? "dia" : "dias"} de streak</span>
          </div>
        )}
      </div>

      {insights.length > 0 && (
        <InsightBanner insight={insights[insightIdx]} total={insights.length} idx={insightIdx} onCycle={(d) => setInsightIdx((i) => (i + d + insights.length) % insights.length)} />
      )}

      <StatStrip
        queueCount={queue.length}
        doneCount={done.length}
        birthdaysCount={birthdays.length}
        rescueCount={rescue.length}
        totalContacts={totalContacts}
        touches7d={touches7d}
        series14={series14}
      />

      <MonthlyTouchesChart contacts={contacts} />

      <div>
        <div className="ps-tabs" role="tablist">
          <TabBtn
            active={tab === "queue"}
            count={queue.length}
            onClick={() => setTab("queue")}
            label="Fila do dia"
          />
          <TabBtn
            active={tab === "birthdays"}
            count={birthdays.length}
            onClick={() => setTab("birthdays")}
            label="Aniversariantes"
          />
          <TabBtn
            active={tab === "rescue"}
            count={rescue.length}
            onClick={() => setTab("rescue")}
            label="Resgate"
          />
          <TabBtn
            active={tab === "done"}
            count={done.length}
            onClick={() => setTab("done")}
            label="Feitos hoje"
          />
        </div>

        <div className="ps-filter-row" style={{ marginTop: 14 }}>
          <span className="ps-filter-pill" style={{ pointerEvents: "none" }}>
            <Filter size={11} strokeWidth={1.75} />
            Ordenado por{" "}
            {tab === "birthdays"
              ? "data do aniversário"
              : tab === "rescue"
                ? "tempo desde último contato"
                : "prioridade"}
          </span>
          <span className="ps-filter-divider" aria-hidden />
          <span style={{ fontSize: 11, color: "var(--ps-ink-3)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>
            Foco
          </span>
          <button
            type="button"
            className="ps-filter-pill"
            onClick={() => openFocus("all")}
          >
            <Target size={11} strokeWidth={1.75} />
            Geral
            <span className="ps-kbd" style={{ marginLeft: 6 }}>F</span>
          </button>
          <button
            type="button"
            className="ps-filter-pill"
            onClick={() => openFocus("vip-cold")}
            disabled={
              queue
                .concat(rescue)
                .filter(
                  (c) =>
                    c.segments?.includes("gasta_bem") &&
                    c.daysSince !== null &&
                    c.daysSince >= 14,
                ).length === 0
            }
          >
            VIPs frios
          </button>
          <button
            type="button"
            className="ps-filter-pill"
            onClick={() => openFocus("birthdays")}
            disabled={birthdays.length === 0}
          >
            Aniversariantes
          </button>
        </div>
      </div>

      <Section
        title={titleFor(tab)}
        subtitle={subtitleFor(tab, list.length)}
        list={list}
        busyId={busyId}
        onMarkDone={markDone}
        emptyHint={emptyHintFor(tab)}
      />
      <EditContactSheet />
    </div>
  );
}

function StatStrip({
  queueCount,
  doneCount,
  birthdaysCount,
  rescueCount,
  totalContacts,
  touches7d,
  series14,
}: {
  queueCount: number;
  doneCount: number;
  birthdaysCount: number;
  rescueCount: number;
  totalContacts: number;
  touches7d: number;
  series14: number[];
}) {
  return (
    <div className="ps-stat-strip">
      <StatCell
        icon={<Zap size={11} strokeWidth={1.75} />}
        label="Fila do dia"
        value={queueCount}
        sub={
          doneCount > 0 ? `${doneCount} feitos hoje` : "nenhum feito ainda"
        }
      />
      <StatCell
        icon={<Flame size={11} strokeWidth={1.75} />}
        label="Toques 7d"
        value={touches7d}
        sub="esta semana"
        spark={series14}
      />
      <StatCell
        icon={<Cake size={11} strokeWidth={1.75} />}
        label="Aniversários"
        value={birthdaysCount}
        sub="próximos 14 dias"
      />
      <StatCell
        icon={<Users size={11} strokeWidth={1.75} />}
        label="Sua base"
        value={totalContacts}
        sub={rescueCount > 0 ? `${rescueCount} pra resgatar` : "tudo em dia"}
      />
    </div>
  );
}

function StatCell({
  icon,
  label,
  value,
  sub,
  spark,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
  spark?: number[];
}) {
  return (
    <div className="ps-stat-cell">
      <div className="lbl">
        {icon}
        {label}
      </div>
      <div className="ps-stat-row">
        <div className="val">{value}</div>
        {spark && <Sparkline values={spark} />}
      </div>
      <div className="sub">
        <span>{sub}</span>
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const w = 96;
  const h = 28;
  const max = Math.max(1, ...values);
  const stepX = w / Math.max(1, values.length - 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = h - (v / max) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const lastY = h - (values[values.length - 1] / max) * (h - 4) - 2;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ flexShrink: 0 }}
      aria-hidden
    >
      <defs>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ps-accent)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--ps-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="url(#sparkfill)"
        stroke="none"
        points={`0,${h} ${points.join(" ")} ${w},${h}`}
      />
      <polyline
        fill="none"
        stroke="var(--ps-accent-2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(" ")}
      />
      <circle cx={w} cy={lastY} r="2.5" fill="var(--ps-accent-2)" />
    </svg>
  );
}

function InsightBanner({
  insight,
  total,
  idx,
  onCycle,
}: {
  insight: Insight;
  total: number;
  idx: number;
  onCycle: (d: number) => void;
}) {
  return (
    <div className={`ps-insight ${insight.tone}`}>
      <Sparkles size={14} strokeWidth={1.75} />
      <span className="ps-insight-text">{insight.text}</span>
      {total > 1 && (
        <div className="ps-insight-pager">
          <button
            type="button"
            onClick={() => onCycle(-1)}
            aria-label="Insight anterior"
            className="ps-icon-btn"
          >
            ‹
          </button>
          <span className="mono" style={{ fontSize: 11, color: "var(--ps-ink-3)" }}>
            {idx + 1}/{total}
          </span>
          <button
            type="button"
            onClick={() => onCycle(1)}
            aria-label="Próximo insight"
            className="ps-icon-btn"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

function TabBtn({
  active,
  count,
  onClick,
  label,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`ps-tab ${active ? "active" : ""}`}
    >
      {label}
      {count > 0 && <span className="c">{count}</span>}
    </button>
  );
}

function Section({
  list,
  busyId,
  onMarkDone,
  emptyHint,
}: {
  title: string;
  subtitle?: string;
  list: EnrichedContact[];
  busyId: string | null;
  onMarkDone: (c: EnrichedContact) => void;
  emptyHint: string;
}) {
  return (
    <div className="ps-sec">
      {list.length === 0 ? (
        <div className="ps-empty">{emptyHint}</div>
      ) : (
        list.map((c, i) => (
          <ContactRow
            key={c.id}
            index={i}
            contact={c}
            busy={busyId === c.id}
            onMarkDone={onMarkDone}
          />
        ))
      )}
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

function cleanHandle(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  let h = trimmed;
  h = h.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  h = h.replace(/^@?/, "");
  h = h.replace(/[\/?#].*$/, "");
  if (!h) return null;
  return "@" + h;
}

function igUrl(value: string): string {
  const handle = cleanHandle(value);
  return handle
    ? `https://instagram.com/${handle.replace(/^@/, "")}`
    : value;
}

function ContactRow({
  index,
  contact,
  busy,
  onMarkDone,
}: {
  index: number;
  contact: EnrichedContact;
  busy: boolean;
  onMarkDone: (c: EnrichedContact) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastContactLabel =
    contact.daysSince === null
      ? "—"
      : contact.daysSince === 0
        ? "hoje"
        : `há ${contact.daysSince}d`;
  const bdayLabel =
    contact.bdayIn !== null
      ? contact.bdayIn === 0
        ? "hoje"
        : `em ${contact.bdayIn}d`
      : "";

  return (
    <div
      className="ps-row"
      onClick={() => router.push(`/app/contacts/${contact.id}`)}
    >
      <button
        type="button"
        className={`num ${contact.isDoneToday ? "done" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!contact.isDoneToday && !busy) onMarkDone(contact);
        }}
        title={contact.isDoneToday ? "Já marcado" : "Marcar como feito"}
        disabled={busy}
      >
        {contact.isDoneToday ? "✓" : String(index + 1).padStart(2, "0")}
      </button>

      <div className="ps-name-cell">
        <div className="ps-avatar sm">{initialsOf(contact.name)}</div>
        <div className="name-stack">
          <span className="name">{contact.name}</span>
          {cleanHandle(contact.instagram) && (
            <span className="handle">{cleanHandle(contact.instagram)}</span>
          )}
        </div>
      </div>

      <span className={`ps-prio ${contact.priority}`}>
        <PrioDot p={contact.priority} />
        {priorityLabel(contact.priority)}
      </span>

      <span className={`ps-pip ${contact.status}`}>
        {statusLabel(contact.status)}
      </span>

      <span className="ps-meta">
        {contact.status === "bday" && bdayLabel
          ? `🎂 ${bdayLabel}`
          : lastContactLabel}
      </span>

      <span className="ps-hint">{contact.hint}</span>

      <div className="ps-actions" onClick={(e) => e.stopPropagation()}>
        {contact.whatsapp && (
          <ChannelTouchLauncher
            channel="whatsapp"
            href={
              formatWhatsappUrl(contact.whatsapp) ??
              `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`
            }
            contactId={contact.id}
            contactName={contact.name}
            renderTrigger={(onClick) => (
              <button
                type="button"
                onClick={onClick}
                aria-label="WhatsApp"
                title="WhatsApp"
                className="ps-channel-btn ps-channel-wa"
              >
                <WhatsAppGlyph size={15} />
              </button>
            )}
          />
        )}
        {contact.instagram && (
          <ChannelTouchLauncher
            channel="instagram"
            href={formatInstagramUrl(contact.instagram) ?? "#"}
            contactId={contact.id}
            contactName={contact.name}
            renderTrigger={(onClick) => (
              <button
                type="button"
                onClick={onClick}
                aria-label="Instagram"
                title="Instagram"
                className="ps-channel-btn ps-channel-ig"
              >
                <InstagramGlyph size={15} />
              </button>
            )}
          />
        )}
        <button
          type="button"
          aria-label="Editar"
          title="Editar contato"
          className="ps-channel-btn ps-channel-edit"
          onClick={(e) => {
            e.stopPropagation();
            const next = new URLSearchParams(searchParams.toString());
            next.set("edit", contact.id);
            router.push(`${pathname}?${next.toString()}`, { scroll: false });
          }}
        >
          <Edit size={14} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

function PrioDot({ p }: { p: Priority }) {
  const color =
    p === "urgent"
      ? "var(--ps-red)"
      : p === "high"
        ? "var(--ps-amber)"
        : p === "med"
          ? "var(--ps-ink-2)"
          : "var(--ps-ink-3)";
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: 2,
        background: color,
        display: "inline-block",
      }}
    />
  );
}

function _UnusedFocusMode_REMOVED({
  contacts,
  onExit,
  onMark,
  busyId,
}: {
  contacts: EnrichedContact[];
  onExit: () => void;
  onMark: (c: EnrichedContact) => void;
  busyId: string | null;
}) {
  const [idx, setIdx] = React.useState(0);
  const c = contacts[idx];
  const total = contacts.length;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (inField) return;
      if (e.key === "Escape") onExit();
      else if (e.key === "ArrowRight" || e.key.toLowerCase() === "j")
        setIdx((i) => Math.min(total - 1, i + 1));
      else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "k")
        setIdx((i) => Math.max(0, i - 1));
      else if (e.key === "Enter" || e.key.toLowerCase() === "d") {
        if (c) onMark(c);
        setTimeout(() => setIdx((i) => Math.min(total - 1, i + 1)), 200);
      } else if (e.key.toLowerCase() === "w") {
        if (c?.whatsapp) {
          window.open(
            `https://wa.me/${c.whatsapp.replace(/\D/g, "")}`,
            "_blank",
          );
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total, c, onMark, onExit]);

  if (!c) {
    return (
      <div className="ps-focus-overlay">
        <div className="ps-focus-top">
          <button className="ps-tb-btn" onClick={onExit}>
            <X size={13} strokeWidth={1.75} />
            Sair
            <span className="ps-kbd">esc</span>
          </button>
          <div style={{ flex: 1 }} />
        </div>
        <div className="ps-focus-content">
          <div className="ps-focus-card" style={{ textAlign: "center" }}>
            <Sparkles
              size={32}
              strokeWidth={1.5}
              style={{ color: "var(--ps-accent-2)", margin: "0 auto" }}
            />
            <div className="ps-focus-name">Tudo em dia</div>
            <p style={{ color: "var(--ps-ink-2)" }}>
              Nenhum contato precisando de atenção agora.
            </p>
            <div>
              <button className="ps-tb-btn outline" onClick={onExit}>
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((idx + 1) / Math.max(1, total)) * 100;

  return (
    <div className="ps-focus-overlay">
      <div className="ps-focus-top">
        <button className="ps-tb-btn" onClick={onExit}>
          <X size={13} strokeWidth={1.75} />
          Sair
          <span className="ps-kbd">esc</span>
        </button>
        <span
          className="mono"
          style={{ fontSize: 13, color: "var(--ps-ink-2)" }}
        >
          {idx + 1} / {total}
        </span>
        <div className="ps-focus-progress">
          <div style={{ width: `${progress}%` }} />
        </div>
        <span
          className="mono"
          style={{ fontSize: 12, color: "var(--ps-ink-3)" }}
        >
          ~{Math.max(0, total - idx - 1) * 2}min restantes
        </span>
      </div>
      <div className="ps-focus-content">
        <div className="ps-focus-card">
          <div
            className="mono"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color:
                c.priority === "urgent"
                  ? "var(--ps-red)"
                  : c.priority === "high"
                    ? "var(--ps-amber)"
                    : "var(--ps-ink-2)",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            {priorityLabel(c.priority)} · {statusLabel(c.status)}
          </div>
          <h2 className="ps-focus-name">{c.name}</h2>
          <div
            style={{
              display: "flex",
              gap: 14,
              color: "var(--ps-ink-2)",
              fontSize: 14,
            }}
          >
            {c.instagram && <span>{c.instagram}</span>}
            {c.whatsapp && <span>·</span>}
            {c.whatsapp && <span>{c.whatsapp}</span>}
          </div>
          <div className="ps-focus-hint">{c.hint}</div>

          <div className="ps-focus-actions">
            {c.whatsapp && (
              <a
                href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ps-tb-btn primary"
                style={{ textDecoration: "none" }}
              >
                <WhatsAppGlyph size={14} />
                WhatsApp
                <span className="ps-kbd">W</span>
              </a>
            )}
            {c.instagram && (
              <a
                href={`https://instagram.com/${c.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ps-tb-btn outline"
                style={{ textDecoration: "none" }}
              >
                <InstagramGlyph size={14} />
                Instagram
              </a>
            )}
            <button
              type="button"
              className="ps-tb-btn outline"
              disabled={busyId === c.id}
              onClick={() => {
                onMark(c);
                setTimeout(
                  () => setIdx((i) => Math.min(total - 1, i + 1)),
                  200,
                );
              }}
            >
              ✓ Marcar feito
              <span className="ps-kbd">D</span>
            </button>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              className="ps-tb-btn"
              disabled={idx === 0}
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
            >
              ← Anterior <span className="ps-kbd">K</span>
            </button>
            <button
              type="button"
              className="ps-tb-btn"
              disabled={idx >= total - 1}
              onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
            >
              Próximo → <span className="ps-kbd">J</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function titleFor(tab: Tab) {
  switch (tab) {
    case "queue":
      return "Fila do dia";
    case "birthdays":
      return "Aniversariantes";
    case "rescue":
      return "Resgate";
    case "done":
      return "Feitos hoje";
  }
}

function subtitleFor(tab: Tab, n: number) {
  if (n === 0) return undefined;
  switch (tab) {
    case "queue":
      return "ordenado por prioridade";
    case "birthdays":
      return "próximos 14 dias";
    case "rescue":
      return "frios há 30+ dias";
    case "done":
      return "tocados hoje";
  }
}

function emptyHintFor(tab: Tab) {
  switch (tab) {
    case "queue":
      return "Sua fila está vazia. Bom trabalho.";
    case "birthdays":
      return "Sem aniversários nos próximos 14 dias.";
    case "rescue":
      return "Nenhum contato frio há mais de 30 dias.";
    case "done":
      return "Você ainda não marcou nenhum contato hoje.";
  }
}
