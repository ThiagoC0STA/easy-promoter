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
import { FormPendingButton } from "@/components/ui/form-pending-button";
import { ActionErrorBanner } from "@/components/ui/action-error-banner";
import { ContactFollowUpBlock } from "@/components/contacts/contact-follow-up-block";
import { ContactTouchHistoryPanel } from "@/components/contacts/contact-touch-history-panel";

type Props = {
  contact?: Contact;
  actionError?: string | null;
};

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-[var(--color-text-tertiary)] leading-snug mt-1.5">
      {children}
    </p>
  );
}

export function ContactForm({ contact, actionError }: Props) {
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
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      >
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
        Voltar para contatos
      </Link>

      {actionError ? <ActionErrorBanner message={actionError} /> : null}

      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
        {isEdit ? "Editar contato" : "Novo contato"}
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-8">
        {isEdit
          ? "Altere os dados e salve. Excluir remove o contato para sempre."
          : "Preencha o que souber. Você pode editar depois."}
      </p>

      <form action={action} className="flex flex-col gap-6">
        {isEdit && <input type="hidden" name="id" value={contact!.id} />}
        <input type="hidden" name="genres" value={genres.join(",")} />

        <fieldset className="glass-card rounded-[var(--radius-card)] p-6 flex flex-col gap-5">
          <legend className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] mb-1">
            Dados básicos
          </legend>

          <label className="flex flex-col gap-1.5">
            <span
              className="text-sm font-medium text-[var(--color-text-primary)]"
              title="Obrigatório. Nome como você chama a pessoa na operação."
            >
              Nome *
            </span>
            <input
              name="name"
              required
              autoComplete="name"
              defaultValue={contact?.name ?? ""}
              className="input-field"
              placeholder="Nome completo"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  WhatsApp
                </span>
                <input
                  name="whatsapp"
                  inputMode="tel"
                  autoComplete="tel"
                  defaultValue={contact?.whatsapp ?? ""}
                  className="input-field"
                  placeholder="5541999999999"
                />
              </label>
              <FieldHint>
                Apenas números, com DDI e DDD. Usamos isso para abrir o WhatsApp.
              </FieldHint>
            </div>
            <div>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  Instagram
                </span>
                <input
                  name="instagram"
                  autoComplete="off"
                  defaultValue={contact?.instagram ?? ""}
                  className="input-field"
                  placeholder="@usuario ou URL completa"
                />
              </label>
              <FieldHint>Pode colar o link do perfil ou só o @.</FieldHint>
            </div>
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
              <span
                className="text-sm font-medium text-[var(--color-text-primary)]"
                title="Usada para o cooldown visual e para priorizar quem precisa de retomada."
              >
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
              <FieldHint>Data em que você falou com a pessoa pela última vez.</FieldHint>
            </label>
          </div>
        </fieldset>

        <fieldset className="glass-card rounded-[var(--radius-card)] p-6 flex flex-col gap-3">
          <legend className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] mb-1">
            Gêneros musicais
          </legend>
          <p id="genre-field-help" className="text-xs text-[var(--color-text-tertiary)] -mt-1 mb-2">
            Toque para marcar ou desmarcar. Pode escolher vários.
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-describedby="genre-field-help"
          >
            {GENRES.map((genre) => {
              const selected = genres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer min-h-10
                    ${selected ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] border-[var(--color-accent)]/30 ring-1 ring-[var(--color-accent)]/20" : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]"}`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="glass-card rounded-[var(--radius-card)] p-6 flex flex-col gap-5">
          <legend
            className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] mb-1"
            title="Um contato pode estar em mais de um segmento. Isso alimenta filtros e o resumo na dashboard."
          >
            Segmentos
          </legend>
          <div className="flex flex-wrap gap-3">
            {SEGMENTS.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2.5 cursor-pointer group min-h-10 py-1"
              >
                <input
                  type="checkbox"
                  name="segments"
                  value={value}
                  defaultChecked={contact?.segments?.includes(value)}
                  className="w-4 h-4 rounded accent-[var(--color-accent)] cursor-pointer shrink-0"
                />
                <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="glass-card rounded-[var(--radius-card)] p-6 flex flex-col gap-5">
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
              rows={4}
              defaultValue={contact?.notes ?? ""}
              className="input-field resize-y min-h-[100px]"
              placeholder="Lembretes, combinados, tom da conversa…"
            />
          </label>
        </fieldset>

        {isEdit && contact ? (
          <div className="flex flex-col gap-5">
            <ContactFollowUpBlock contactId={contact.id} />
            <ContactTouchHistoryPanel contactId={contact.id} />
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-[var(--color-border-subtle)]">
          {isEdit && (
            <div className="flex flex-wrap items-center gap-2">
              {!deleting ? (
                <button
                  type="button"
                  onClick={() => setDeleting(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium min-h-11
                             text-[var(--color-error)] hover:bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)]
                             transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-error)]"
                >
                  <Trash2 size={16} strokeWidth={1.5} aria-hidden />
                  Excluir contato
                </button>
              ) : (
                <>
                  <div className="w-full flex flex-col gap-2 sm:max-w-md">
                    <span className="text-sm text-[var(--color-error)] font-semibold">
                      Excluir este contato?
                    </span>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      Isso remove a pessoa da sua base e apaga o histórico de ritmo de
                      contato neste app. Não dá para desfazer.
                    </p>
                  </div>
                  <FormPendingButton
                    variant="danger"
                    formAction={deleteContactAction}
                    pendingLabel="Excluindo…"
                  >
                    Sim, excluir
                  </FormPendingButton>
                  <button
                    type="button"
                    onClick={() => setDeleting(false)}
                    className="min-h-11 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] cursor-pointer border border-[var(--color-border)]"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          )}
          <div className="sm:ml-auto flex justify-end">
            <FormPendingButton
              variant="primary"
              pendingLabel={isEdit ? "Salvando…" : "Criando…"}
            >
              <Save size={18} strokeWidth={1.75} aria-hidden />
              {isEdit ? "Salvar alterações" : "Criar contato"}
            </FormPendingButton>
          </div>
        </div>
      </form>
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
        className="input-field cursor-pointer appearance-none min-h-11"
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
