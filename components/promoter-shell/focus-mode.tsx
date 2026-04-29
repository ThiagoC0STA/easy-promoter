"use client";

import * as React from "react";
import { Sparkles, X } from "lucide-react";
import { WhatsAppGlyph } from "@/components/icons/whatsapp-glyph";
import { InstagramGlyph } from "@/components/icons/instagram-glyph";
import {
  type EnrichedContact,
  priorityLabel,
  statusLabel,
} from "@/lib/contacts/queue";

type Props = {
  contacts: EnrichedContact[];
  onExit: () => void;
  onMark: (c: EnrichedContact) => void | Promise<void>;
  busyId: string | null;
};

export function FocusMode({ contacts, onExit, onMark, busyId }: Props) {
  const [idx, setIdx] = React.useState(0);
  const c = contacts[idx];
  const total = contacts.length;

  React.useEffect(() => {
    setIdx(0);
  }, [contacts.length]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (inField) return;
      if (e.key === "Escape") {
        onExit();
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "j") {
        setIdx((i) => Math.min(total - 1, i + 1));
      } else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "k") {
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter" || e.key.toLowerCase() === "d") {
        if (c) void onMark(c);
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
  const igHandle = c.instagram
    ? c.instagram
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
        .replace(/^@/, "")
        .replace(/[\/?#].*$/, "")
    : "";

  return (
    <div className="ps-focus-overlay">
      <div className="ps-focus-top">
        <button className="ps-tb-btn" onClick={onExit}>
          <X size={13} strokeWidth={1.75} />
          Sair
          <span className="ps-kbd">esc</span>
        </button>
        <span className="mono" style={{ fontSize: 13, color: "var(--ps-ink-2)" }}>
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
                href={`https://instagram.com/${igHandle}`}
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
                void onMark(c);
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
