import { Signal } from "@/lib/data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function SignalBadge({ signal }: { signal: Signal }) {
  const config = {
    buy: {
      className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-400",
      Icon: TrendingUp,
    },
    sell: {
      className: "border-red-400/25 bg-red-400/10 text-red-400",
      Icon: TrendingDown,
    },
    hold: {
      className: "border-amber-400/25 bg-amber-400/10 text-amber-400",
      Icon: Minus,
    },
  }[signal];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium tracking-[0.05em] ${config.className}`}
      aria-label={`Signal ${signal}`}
    >
      <config.Icon size={10} />
      {signal.toUpperCase()}
    </span>
  );
}
