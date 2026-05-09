"use client";
import { Stock } from "@/lib/data";

interface WatchlistProps {
  stocks: Stock[];
  watchlist: string[];
  selectedTicker: string;
  onSelect: (ticker: string) => void;
}

export default function Watchlist({ stocks, watchlist, selectedTicker, onSelect }: WatchlistProps) {
  const wlStocks = watchlist.map((t) => stocks.find((s) => s.ticker === t)).filter(Boolean) as Stock[];

  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-white/10 bg-[var(--bg-secondary)]" aria-label="Watchlist panel">
      <header className="border-b border-white/10 px-4 py-3.5">
        <h2 className="m-0 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">Watchlist</h2>
      </header>

      <ul className="m-0 list-none p-0">
        {wlStocks.map((s) => {
          const isPos = s.change >= 0;
          const sign = isPos ? "+" : "";
          const isActive = s.ticker === selectedTicker;

          return (
            <li key={s.ticker}>
              <button
                type="button"
                onClick={() => onSelect(s.ticker)}
                className={`flex w-full cursor-pointer items-center justify-between border-b border-white/5 px-4 py-2.5 text-left transition-colors ${
                  isActive
                    ? "border-l-2 border-l-[var(--accent)] bg-sky-400/10"
                    : "border-l-2 border-l-transparent bg-transparent"
                }`}
              >
                <span>
                  <span className="block text-[13px] font-medium tracking-[0.04em] text-[var(--text-primary)]">{s.ticker}</span>
                  <span className="mt-0.5 block text-[10px] text-[var(--text-muted)]">{s.name.split(" ")[0]}</span>
                </span>
                <span className="text-right">
                  <span className="block text-[13px] text-[var(--text-primary)]">${s.price.toFixed(2)}</span>
                  <span className={`mt-0.5 block text-[10px] ${isPos ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                    {sign}
                    {s.change.toFixed(2)}%
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
