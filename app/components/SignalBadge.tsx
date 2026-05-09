import { Signal } from "@/lib/data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function SignalBadge({ signal }: { signal: Signal }) {
  const config = {
    buy:  { bg: "rgba(52,211,153,0.12)", color: "#34d399", border: "rgba(52,211,153,0.25)", Icon: TrendingUp },
    sell: { bg: "rgba(248,113,113,0.12)", color: "#f87171", border: "rgba(248,113,113,0.25)", Icon: TrendingDown },
    hold: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "rgba(251,191,36,0.2)", Icon: Minus },
  }[signal];

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 500,
      letterSpacing: "0.05em", background: config.bg, color: config.color,
      border: `0.5px solid ${config.border}`,
    }}>
      <config.Icon size={10} />
      {signal.toUpperCase()}
    </span>
  );
}
