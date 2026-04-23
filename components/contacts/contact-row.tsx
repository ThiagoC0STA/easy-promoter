"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Cake, Edit } from "lucide-react";
import { WhatsAppGlyph } from "@/components/icons/whatsapp-glyph";
import type { Contact } from "@/lib/contacts/types";
import { FREQUENCY_OPTIONS, SPENDING_OPTIONS } from "@/lib/contacts/types";
import type { ColumnKey } from "@/lib/contacts/column-config";
import { DEFAULT_VISIBLE } from "@/lib/contacts/column-config";
import {
  daysSinceContact,
  defaultWhatsappPrefillText,
  formatInstagramUrl,
  formatWhatsappUrl,
  getCooldownStatus,
  isBirthdaySoon,
  daysUntilBirthday,
} from "@/lib/contacts/utils";
import { CooldownBadge } from "./cooldown-badge";
import { ChannelTouchLauncher } from "./channel-touch-launcher";

type Props = {
  contact: Contact;
  readOnly?: boolean;
  visibleCols?: ColumnKey[];
};

function InstagramGlyphStatic() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}


function ContactActions({ contact, readOnly, waUrl, igUrl }: {
  contact: Contact;
  readOnly: boolean;
  waUrl: string | null;
  igUrl: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const waLaunch = React.useRef<(() => void) | null>(null);
  const igLaunch = React.useRef<(() => void) | null>(null);

  function handleOpenEdit() {
    const next = new URLSearchParams(searchParams.toString());
    next.set("edit", contact.id);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const hasActions = waUrl || igUrl || !readOnly;
  if (!hasActions) return null;

  return (
    <div className="flex items-center gap-1">
      {waUrl && !readOnly && (
        <ChannelTouchLauncher channel="whatsapp" href={waUrl} contactId={contact.id} contactName={contact.name}
          renderTrigger={(onClick) => {
            waLaunch.current = onClick;
            return (
              <button type="button" onClick={onClick} aria-label="WhatsApp"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer">
                <WhatsAppGlyph size={15} />
              </button>
            );
          }}
        />
      )}
      {waUrl && readOnly && (
        <a href={waUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 transition-colors">
          <WhatsAppGlyph size={15} />
        </a>
      )}
      {igUrl && !readOnly && (
        <ChannelTouchLauncher channel="instagram" href={igUrl} contactId={contact.id} contactName={contact.name}
          renderTrigger={(onClick) => {
            igLaunch.current = onClick;
            return (
              <button type="button" onClick={onClick} aria-label="Instagram"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-pink-500 hover:bg-pink-500/10 transition-colors cursor-pointer">
                <InstagramGlyphStatic />
              </button>
            );
          }}
        />
      )}
      {igUrl && readOnly && (
        <a href={igUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-pink-500 hover:bg-pink-500/10 transition-colors">
          <InstagramGlyphStatic />
        </a>
      )}
      {!readOnly && (
        <button type="button" onClick={handleOpenEdit} aria-label="Editar"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer">
          <Edit size={14} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

export function ContactRow({ contact, readOnly = false, visibleCols = DEFAULT_VISIBLE }: Props) {
  const col = (key: ColumnKey) => visibleCols.includes(key);
  const days = daysSinceContact(contact.last_contacted_at);
  const status = getCooldownStatus(contact.last_contacted_at);
  const igUrl = formatInstagramUrl(contact.instagram);
  const bdaySoon = isBirthdaySoon(contact.birthday);
  const bdayDays = daysUntilBirthday(contact.birthday);
  const waUrl = formatWhatsappUrl(contact.whatsapp, {
    prefilledText: defaultWhatsappPrefillText(contact.name),
  });

  const tags = contact.genres.map((g) => ({ key: `g-${g}`, label: g, accent: false }));
  const visibleTags = tags.slice(0, 3);
  const overflowTags = tags.length - visibleTags.length;

  return (
    <div
      className="ep-contact-row-grid gap-x-4 gap-y-1 items-center
                  border-b border-[var(--color-border-subtle)] last:border-b-0
                  hover:bg-[var(--color-surface-secondary)]/60 transition-colors py-3 px-3 sm:px-4"
    >
      {/* Name */}
      <div className="min-w-0 flex items-center gap-2">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {contact.name}
        </h3>
        {bdaySoon && (
          <span
            title={bdayDays === 0 ? "Aniversário hoje" : `Aniversário em ${bdayDays} dias`}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-pink-600 dark:text-pink-400 bg-pink-500/10 shrink-0"
          >
            <Cake size={10} strokeWidth={2} />
            {bdayDays === 0 ? "Hoje" : `${bdayDays}d`}
          </span>
        )}
      </div>

      {/* Tags */}
      {col("tags") && (
        <div className="hidden sm:flex flex-wrap items-center gap-1.5 min-w-0">
          {visibleTags.map((t) => (
            <span key={t.key}
              className={t.accent
                ? "px-1.5 py-0.5 rounded text-[11px] font-medium text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                : "px-1.5 py-0.5 rounded text-[11px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] border border-[var(--color-border-subtle)]"
              }>
              {t.label}
            </span>
          ))}
          {overflowTags > 0 && (
            <span className="text-[11px] text-[var(--color-text-tertiary)]">+{overflowTags}</span>
          )}
        </div>
      )}

      {/* Last contact */}
      {col("last_contact") && (
        <div className="hidden sm:block min-w-0">
          <CooldownBadge status={status} days={days} minimal />
        </div>
      )}

      {/* Birthday */}
      {col("birthday") && (
        <div className="hidden sm:flex items-center gap-1.5 min-w-0">
          {contact.birthday ? (
            <>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {(() => { const [, m, d] = contact.birthday.split("-"); return `${d}/${m}`; })()}
              </span>
              {bdaySoon && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold text-pink-600 dark:text-pink-400 bg-pink-500/10 shrink-0">
                  <Cake size={9} strokeWidth={2} />
                  {bdayDays === 0 ? "Hoje" : `${bdayDays}d`}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-[var(--color-text-tertiary)]">—</span>
          )}
        </div>
      )}

      {/* Frequency */}
      {col("frequency") && (
        <div className="hidden sm:flex items-center min-w-0">
          {contact.frequency ? (
            <span className="text-sm text-[var(--color-text-secondary)]">
              {FREQUENCY_OPTIONS.find((o) => o.value === contact.frequency)?.label ?? contact.frequency}
            </span>
          ) : (
            <span className="text-sm text-[var(--color-text-tertiary)]">—</span>
          )}
        </div>
      )}

      {/* Spending */}
      {col("spending") && (
        <div className="hidden sm:flex items-center min-w-0">
          {contact.spending ? (
            <span className="text-sm text-[var(--color-text-secondary)]">
              {SPENDING_OPTIONS.find((o) => o.value === contact.spending)?.label ?? contact.spending}
            </span>
          ) : (
            <span className="text-sm text-[var(--color-text-tertiary)]">—</span>
          )}
        </div>
      )}

      {/* Notes */}
      {col("notes") && (
        <div className="hidden sm:flex items-center min-w-0">
          {contact.notes ? (
            <span className="text-sm text-[var(--color-text-secondary)] truncate" title={contact.notes}>
              {contact.notes}
            </span>
          ) : (
            <span className="text-sm text-[var(--color-text-tertiary)]">—</span>
          )}
        </div>
      )}

      {/* 3-dot actions menu */}
      <div className="flex items-center justify-end row-start-1 col-start-2 sm:row-auto sm:col-auto">
        <ContactActions contact={contact} readOnly={readOnly} waUrl={waUrl} igUrl={igUrl} />
      </div>

      {/* Mobile meta line */}
      <div className="sm:hidden col-span-full flex items-center gap-2 text-[11px] text-[var(--color-text-tertiary)] -mt-0.5">
        {col("last_contact") && <CooldownBadge status={status} days={days} minimal />}
        {col("tags") && tags.length > 0 && (
          <>
            <span aria-hidden>·</span>
            <span className="truncate">{visibleTags.map((t) => t.label).join(", ")}{overflowTags > 0 ? ` +${overflowTags}` : ""}</span>
          </>
        )}
      </div>
    </div>
  );
}
