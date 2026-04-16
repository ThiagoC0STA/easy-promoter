"use client";

import * as React from "react";
import { WifiOff } from "lucide-react";

export function OnlineStatusBanner() {
  const [online, setOnline] = React.useState(true);

  React.useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    function onUp() {
      setOnline(true);
    }
    function onDown() {
      setOnline(false);
    }
    window.addEventListener("online", onUp);
    window.addEventListener("offline", onDown);
    return () => {
      window.removeEventListener("online", onUp);
      window.removeEventListener("offline", onDown);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-500/35 bg-[color-mix(in_srgb,amber_12%,var(--color-surface-secondary))] px-4 py-2"
    >
      <div className="mx-auto max-w-6xl flex items-center gap-2 text-xs font-medium text-amber-950 dark:text-amber-100">
        <WifiOff size={14} strokeWidth={1.75} className="shrink-0" aria-hidden />
        <span>
          Você está offline. Os dados podem estar desatualizados até a conexão voltar.
        </span>
      </div>
    </div>
  );
}
