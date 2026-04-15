"use client";

import * as React from "react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Contact } from "@/lib/contacts/types";
import {
  CONFIRMED_OPTIONS,
  FREQUENCY_OPTIONS,
  GENRES,
  POST_TYPE_OPTIONS,
  REACH_OPTIONS,
  RESPONDED_OPTIONS,
  SEGMENTS,
  SPENDING_OPTIONS,
} from "@/lib/contacts/types";
import {
  createContactAction,
  deleteContactAction,
  updateContactAction,
} from "@/lib/contacts/actions";

type Props = {
  contact?: Contact;
};

export function ContactForm({ contact }: Props) {
  const isEdit = Boolean(contact);
  const action = isEdit ? updateContactAction : createContactAction;

  const [genres, setGenres] = React.useState<string[]>(
    contact?.genres ?? [],
  );
  const [deleting, setDeleting] = React.useState(false);

  function toggleGenre(genre: string) {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-10 sm:py-14">
      <Link
        href="/app/contacts"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Voltar
      </Link>

      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-8">
        {isEdit ? "Editar contato" : "Novo contato"}
      </h1>

      <form id="contact-main-form" action={action} className="flex flex-col gap-6">
        {isEdit && <input type="hidden" name="id" value={contact!.id} />}
        <input type="hidden" name="genres" value={genres.join(",")} />

        <fieldset className="glass-card rounded-2xl p-6 flex flex-col gap-5">
          <legend className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] mb-1">
            Dados básicos
          </legend>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              Nome *
            </span>
            <input
              name="name"
              required
              defaultValue={contact?.name ?? ""}
              className="input-field"
              placeholder="Nome completo"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                WhatsApp
              </span>
              <input
                name="whatsapp"
                defaultValue={contact?.whatsapp ?? ""}
                className="input-field"
                placeholder="5541999999999"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                Instagram
              </span>
              <input
                name="instagram"
                defaultValue={contact?.instagram ?? ""}
                className="input-field"
                placeholder="@usuario ou URL"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                Aniversário
              </span>
              <input
                type="date"
                name="birthday"
                defaultValue={contact?.birthday ?? ""}
                className="input-field"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                Último contato
              </span>
              <input
                type="date"
                name="last_contacted_at"
                defaultValue={
                  contact?.last_contacted_at
                    ? contact.last_contacted_at.split("T")[0]
                    : ""
                }
                className="input-field"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="glass-card rounded-2xl p-6 flex flex-col gap-5">
          <legend className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] mb-1">
            Gêneros musicais
          </legend>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => {
              const selected = genres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer
                    ${selected ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] border-[var(--color-accent)]/30" : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]"}`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="glass-card rounded-2xl p-6 flex flex-col gap-5">
          <legend className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] mb-1">
            Segmentos
          </legend>
          <div className="flex flex-wrap gap-3">
            {SEGMENTS.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  name="segments"
                  value={value}
                  defaultChecked={contact?.segments?.includes(value)}
                  className="w-4 h-4 rounded accent-[var(--color-accent)] cursor-pointer"
                />
                <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="glass-card rounded-2xl p-6 flex flex-col gap-5">
          <legend className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] mb-1">
            Detalhes
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              name="frequency"
              label="Frequência"
              options={FREQUENCY_OPTIONS}
              defaultValue={contact?.frequency}
            />
            <SelectField
              name="spending"
              label="Gasta"
              options={SPENDING_OPTIONS}
              defaultValue={contact?.spending}
            />
            <SelectField
              name="post_type"
              label="Tipo de post"
              options={POST_TYPE_OPTIONS}
              defaultValue={contact?.post_type}
            />
            <SelectField
              name="reach"
              label="Alcance"
              options={REACH_OPTIONS}
              defaultValue={contact?.reach}
            />
            <SelectField
              name="confirmed"
              label="Confirmação"
              options={CONFIRMED_OPTIONS}
              defaultValue={contact?.confirmed}
            />
            <SelectField
              name="responded"
              label="Respondeu"
              options={RESPONDED_OPTIONS}
              defaultValue={contact?.responded}
            />
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              Observações
            </span>
            <textarea
              name="notes"
              rows={3}
              defaultValue={contact?.notes ?? ""}
              className="input-field resize-y"
              placeholder="Notas sobre o contato..."
            />
          </label>
        </fieldset>
      </form>

      <div className="flex items-center justify-between gap-4 mt-6">
        {isEdit && (
          <>
            {!deleting ? (
              <button
                type="button"
                onClick={() => setDeleting(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           text-[var(--color-error)] hover:bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)]
                           transition-all cursor-pointer"
              >
                <Trash2 size={16} strokeWidth={1.5} />
                Excluir
              </button>
            ) : (
              <form action={deleteContactAction} className="flex items-center gap-2 flex-wrap">
                <input type="hidden" name="id" value={contact!.id} />
                <span className="text-sm text-[var(--color-error)]">Confirma?</span>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-[var(--color-error)] cursor-pointer"
                >
                  Sim, excluir
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(false)}
                  className="px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-secondary)] cursor-pointer"
                >
                  Cancelar
                </button>
              </form>
            )}
          </>
        )}
        <div className="ml-auto">
          <button type="submit" form="contact-main-form" className="btn-primary">
            <Save size={18} strokeWidth={1.75} />
            {isEdit ? "Salvar" : "Criar contato"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectField({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: readonly { value: string; label: string }[];
  defaultValue?: string | null;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="input-field cursor-pointer appearance-none"
      >
        <option value="">Selecione</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
