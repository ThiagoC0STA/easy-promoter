"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { GENRES, SEGMENTS } from "@/lib/contacts/types";
import { MultiSelect } from "./multi-select";

const GENRE_OPTIONS = GENRES.map((g) => ({ value: g, label: g }));

type Filters = {
  search: string;
  genres: string[];
  segments: string[];
};

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export function FilterBar({ filters, onChange }: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const hasFilters = filters.genres.length > 0 || filters.segments.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            strokeWidth={1.5}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="input-field input-with-icon"
          />
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer
            ${hasFilters ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]"}`}
        >
          <SlidersHorizontal size={16} strokeWidth={1.5} />
          Filtros
          {hasFilters && (
            <span className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-xs flex items-center justify-center">
              {filters.genres.length + filters.segments.length}
            </span>
          )}
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, genres: [], segments: [] })}
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-tertiary)]
                       hover:text-[var(--color-error)] transition-colors cursor-pointer"
          >
            <X size={14} strokeWidth={1.5} />
            Limpar
          </button>
        )}
      </div>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
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
        </div>
      )}
    </div>
  );
}
