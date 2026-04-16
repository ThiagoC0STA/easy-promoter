"use client";

import Link from "next/link";
import { Cake, Edit, Phone } from "lucide-react";
import type { Contact } from "@/lib/contacts/types";
import {
  daysSinceContact,
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
};

function InstagramGlyphStatic() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ContactRow({ contact, readOnly = false }: Props) {
  const days = daysSinceContact(contact.last_contacted_at);
  const status = getCooldownStatus(contact.last_contacted_at);
  const waUrl = formatWhatsappUrl(contact.whatsapp);
  const igUrl = formatInstagramUrl(contact.instagram);
  const bdaySoon = isBirthdaySoon(contact.birthday);
  const bdayDays = daysUntilBirthday(contact.birthday);

  return (
    <div className="glass-card rounded-[var(--radius-card)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
            {contact.name}
          </h3>
          {bdaySoon && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-500 border border-pink-500/20">
              <Cake size={10} strokeWidth={2} />
              {bdayDays === 0 ? "Hoje!" : `${bdayDays}d`}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CooldownBadge status={status} days={days} />
          {contact.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {contact.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                >
                  {g}
                </span>
              ))}
              {contact.genres.length > 3 && (
                <span className="text-[10px] text-[var(--color-text-tertiary)]">
                  +{contact.genres.length - 3}
                </span>
              )}
            </div>
          )}
          {contact.segments.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {contact.segments.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/20"
                >
                  {s === "gasta_bem" ? "Gasta bem" : s === "posta" ? "Posta" : "Mailing"}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {waUrl &&
          (!readOnly ? (
            <ChannelTouchLauncher
              channel="whatsapp"
              href={waUrl}
              contactId={contact.id}
              contactName={contact.name}
            />
          ) : (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir WhatsApp"
              aria-label={`WhatsApp de ${contact.name}`}
              className="min-w-11 min-h-11 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)]
                         hover:text-emerald-500 hover:bg-emerald-500/10 transition-all
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              <Phone size={16} strokeWidth={1.5} aria-hidden />
            </a>
          ))}
        {igUrl &&
          (!readOnly ? (
            <ChannelTouchLauncher
              channel="instagram"
              href={igUrl}
              contactId={contact.id}
              contactName={contact.name}
            />
          ) : (
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir Instagram"
              aria-label={`Instagram de ${contact.name}`}
              className="min-w-11 min-h-11 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)]
                         hover:text-pink-500 hover:bg-pink-500/10 transition-all
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
            >
              <InstagramGlyphStatic />
            </a>
          ))}

        {!readOnly && (
          <Link
            href={`/app/contacts/${contact.id}/edit`}
            aria-label={`Editar ${contact.name}`}
            title="Editar"
            className="min-w-11 min-h-11 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)]
                       hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition-all
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            <Edit size={16} strokeWidth={1.5} aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
