"use client";

import {
  FREQUENCY_OPTIONS,
  GENRES,
  SEGMENTS,
  SPENDING_OPTIONS,
} from "@/lib/contacts/types";
import {
  type ContactListFilters,
  formatSortPreset,
  parseSortPreset,
  SORT_PRESET_OPTIONS,
} from "@/lib/contacts/contact-list-utils";
import { MultiSelect } from "./multi-select";

const GENRE_OPTIONS = GENRES.map((g) => ({ value: g, label: g }));

const COOLDOWN_OPTIONS = [
  { value: "all" as const, label: "Qualquer recência" },
  { value: "never" as const, label: "Nunca contatado" },
  { value: "hot" as const, label: "Quente (até 4 dias)" },
  { value: "warm" as const, label: "Morno (5 a 9 dias)" },
  { value: "cold" as const, label: "Frio (10+ dias)" },
];

const CHANNEL_OPTIONS = [
  { value: "all" as const, label: "Todos" },
  { value: "yes" as const, label: "Preenchido" },
  { value: "no" as const, label: "Vazio" },
];

const FREQUENCY_SELECT = [
  { value: "", label: "Qualquer frequência" },
  ...FREQUENCY_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
];

const SPENDING_SELECT = [
  { value: "", label: "Qualquer gasto" },
  ...SPENDING_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
];

type Props = {
  filters: ContactListFilters;
  onChange: (filters: ContactListFilters) => void;
};

export function ContactFilterPanel({ filters, onChange }: Props) {
  const sortValue = formatSortPreset(filters.sortBy, filters.sortDir);

  return (
    <div
      id="contact-filters-panel"
      role="region"
      aria-labelledby="filter-panel-toggle"
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)]"
    >
      <div className="sm:col-span-2">
        <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">
          Ordenação
        </label>
        <select
          className="input-field min-h-11 cursor-pointer"
          value={sortValue}
          onChange={(e) => {
            const { sortBy, sortDir } = parseSortPreset(e.target.value);
            onChange({ ...filters, sortBy, sortDir });
          }}
          aria-label="Ordenar lista de contatos"
        >
          {SORT_PRESET_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">
          Gêneros musicais
        </label>
        <MultiSelect
          options={GENRE_OPTIONS}
          selected={filters.genres}
          onChange={(genres) => onChange({ ...filters, genres })}
          placeholder="Todos os gêneros"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">
          Segmentos
        </label>
        <MultiSelect
          options={[...SEGMENTS]}
          selected={filters.segments}
          onChange={(segments) => onChange({ ...filters, segments })}
          placeholder="Todos os segmentos"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">
          Recência do contato
        </label>
        <select
          className="input-field min-h-11 cursor-pointer"
          value={filters.cooldown}
          onChange={(e) =>
            onChange({
              ...filters,
              cooldown: e.target.value as ContactListFilters["cooldown"],
            })
          }
          aria-label="Filtrar por recência do último contato"
        >
          {COOLDOWN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">
          Frequência de postagem
        </label>
        <select
          className="input-field min-h-11 cursor-pointer"
          value={filters.frequency}
          onChange={(e) =>
            onChange({ ...filters, frequency: e.target.value })
          }
          aria-label="Filtrar por frequência"
        >
          {FREQUENCY_SELECT.map((o) => (
            <option key={o.value || "any"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">
          Gasto com festa
        </label>
        <select
          className="input-field min-h-11 cursor-pointer"
          value={filters.spending}
          onChange={(e) =>
            onChange({ ...filters, spending: e.target.value })
          }
          aria-label="Filtrar por gasto"
        >
          {SPENDING_SELECT.map((o) => (
            <option key={o.value || "any"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">
          WhatsApp
        </label>
        <select
          className="input-field min-h-11 cursor-pointer"
          value={filters.whatsapp}
          onChange={(e) =>
            onChange({
              ...filters,
              whatsapp: e.target.value as ContactListFilters["whatsapp"],
            })
          }
          aria-label="Filtrar por campo WhatsApp"
        >
          {CHANNEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">
          Instagram
        </label>
        <select
          className="input-field min-h-11 cursor-pointer"
          value={filters.instagram}
          onChange={(e) =>
            onChange({
              ...filters,
              instagram: e.target.value as ContactListFilters["instagram"],
            })
          }
          aria-label="Filtrar por campo Instagram"
        >
          {CHANNEL_OPTIONS.map((o) => (
            <option key={`ig-${o.value}`} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2 flex items-center gap-2 pt-1">
        <input
          id="filter-birthday-soon"
          type="checkbox"
          checked={filters.birthdaySoon}
          onChange={(e) =>
            onChange({ ...filters, birthdaySoon: e.target.checked })
          }
          className="size-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] cursor-pointer"
        />
        <label
          htmlFor="filter-birthday-soon"
          className="text-sm text-[var(--color-text-primary)] cursor-pointer select-none"
        >
          Aniversário nos próximos 7 dias
        </label>
      </div>
    </div>
  );
}
