import { Clock } from "lucide-react";
import type { CooldownStatus } from "@/lib/contacts/utils";

const CONFIG: Record<CooldownStatus, { bg: string; text: string; label: string }> = {
  cold: {
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "Disponível",
  },
  warm: {
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    label: "Recente",
  },
  hot: {
    bg: "bg-red-500/10 border-red-500/20",
    text: "text-red-600 dark:text-red-400",
    label: "Aguardar",
  },
};

type Props = {
  status: CooldownStatus;
  days: number | null;
};

export function CooldownBadge({ status, days }: Props) {
  const { bg, text, label } = CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${bg} ${text}`}
    >
      <Clock size={12} strokeWidth={2} />
      {days === null ? "Nunca" : `${days}d`}
      <span className="hidden sm:inline">· {label}</span>
    </span>
  );
}
