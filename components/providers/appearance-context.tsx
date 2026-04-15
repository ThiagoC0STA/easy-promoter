"use client";

import * as React from "react";

export type AppearancePreference = "light" | "dark" | "inherit";

const STORAGE_KEY = "easy-promoter-appearance";

type AppearanceContextValue = {
  appearance: AppearancePreference;
  setAppearance: (value: AppearancePreference) => void;
};

const AppearanceContext = React.createContext<AppearanceContextValue | null>(
  null,
);

export function AppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appearance, setAppearanceState] =
    React.useState<AppearancePreference>("inherit");

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "inherit") {
      setAppearanceState(stored);
    }
  }, []);

  const setAppearance = React.useCallback((value: AppearancePreference) => {
    setAppearanceState(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  }, []);

  const value = React.useMemo(
    () => ({ appearance, setAppearance }),
    [appearance, setAppearance],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = React.useContext(AppearanceContext);
  if (!ctx) {
    throw new Error("useAppearance must be used within AppearanceProvider");
  }
  return ctx;
}
