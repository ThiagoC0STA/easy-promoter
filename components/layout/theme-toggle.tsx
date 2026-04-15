"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import {
  type AppearancePreference,
  useAppearance,
} from "@/components/providers/appearance-context";

function nextAppearance(current: AppearancePreference): AppearancePreference {
  if (current === "light") return "dark";
  if (current === "dark") return "inherit";
  return "light";
}

function ThemeIcon({ mode }: { mode: AppearancePreference }) {
  const size = 18;
  const sw = 1.5;
  if (mode === "light") return <Sun size={size} strokeWidth={sw} />;
  if (mode === "dark") return <Moon size={size} strokeWidth={sw} />;
  return <Monitor size={size} strokeWidth={sw} />;
}

function labelFor(mode: AppearancePreference): string {
  if (mode === "light") return "Tema claro";
  if (mode === "dark") return "Tema escuro";
  return "Tema do sistema";
}

export function ThemeToggle() {
  const { appearance, setAppearance } = useAppearance();

  return (
    <button
      type="button"
      onClick={() => setAppearance(nextAppearance(appearance))}
      aria-label={labelFor(appearance)}
      title={labelFor(appearance)}
      className="flex items-center justify-center w-9 h-9 rounded-full
                 text-[var(--color-text-secondary)]
                 hover:text-[var(--color-text-primary)]
                 hover:bg-[var(--color-accent-muted)]
                 transition-all duration-200 cursor-pointer"
    >
      <ThemeIcon mode={appearance} />
    </button>
  );
}
