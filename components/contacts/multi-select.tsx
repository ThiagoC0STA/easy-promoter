"use client";

import * as React from "react";
import { X } from "lucide-react";

type Option = { value: string; label: string };

type Props = {
  options: readonly Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

export function MultiSelect({ options, selected, onChange, placeholder }: Props) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function remove(value: string) {
    onChange(selected.filter((v) => v !== value));
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input-field flex items-center gap-2 min-h-[42px] text-left cursor-pointer"
      >
        {selected.length === 0 ? (
          <span className="text-[var(--color-text-tertiary)]">
            {placeholder ?? "Selecione..."}
          </span>
        ) : (
          <span className="flex flex-wrap gap-1.5">
            {selected.map((val) => {
              const opt = options.find((o) => o.value === val);
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium
                             bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/20"
                >
                  {opt?.label ?? val}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(val);
                    }}
                    className="hover:text-[var(--color-error)] transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--color-border)]
                     bg-[var(--color-surface-elevated)] shadow-xl max-h-56 overflow-y-auto"
        >
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors cursor-pointer
                  ${isSelected ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-medium" : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]"}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
