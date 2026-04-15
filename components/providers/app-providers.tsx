"use client";

import * as React from "react";
import {
  AppearanceProvider,
  useAppearance,
} from "@/components/providers/appearance-context";

function DarkModeSync({ children }: { children: React.ReactNode }) {
  const { appearance } = useAppearance();

  React.useEffect(() => {
    const root = document.documentElement;
    let isDark = false;

    if (appearance === "dark") {
      isDark = true;
    } else if (appearance === "inherit") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    root.classList.toggle("dark", isDark);
  }, [appearance]);

  React.useEffect(() => {
    if (appearance !== "inherit") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [appearance]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppearanceProvider>
      <DarkModeSync>{children}</DarkModeSync>
    </AppearanceProvider>
  );
}
