"use client";
import { Stock } from "@/lib/data";

interface WatchlistProps {
  stocks: Stock[];
  watchlist: string[];
  selectedTicker: string;
  onSelect: (ticker: string) => void;
}

export default function Watchlist({ stocks, watchlist, selectedTicker, onSelect }: WatchlistProps) {
  const wlStocks = watchlist.map(t => stocks.find(s => s.ticker === t)).filter(Boolean) as Stock[];

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      borderRight: "0.5px solid var(--border)",
      background: "var(--bg-secondary)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "14px 16px", borderBottom: "0.5px solid var(--border)" }}>
        <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", color: "var(--text-muted)", textTransform: "uppercase", margin: 0 }}>
          Watchlist
        </p>
      </div>

      {wlStocks.map(s => {
        const isPos = s.change >= 0;
        const sign = isPos ? "+" : "";
        const isActive = s.ticker === selectedTicker;
        return (
          <div
            key={s.ticker}
            onClick={() => onSelect(s.ticker)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 16px", cursor: "pointer",
              borderBottom: "0.5px solid rgba(255,255,255,0.04)",
              borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              background: isActive ? "rgba(56,189,248,0.08)" : "transparent",
              transition: "background 0.12s",
            }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0, letterSpacing: "0.04em" }}>{s.ticker}</p>
              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "2px 0 0" }}>{s.name.split(" ")[0]}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0 }}>${s.price.toFixed(2)}</p>
              <p style={{ fontSize: 10, color: isPos ? "var(--green)" : "var(--red)", margin: "2px 0 0" }}>
                {sign}{s.change.toFixed(2)}%
              </p>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
