"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { Stock, Signal } from "@/lib/data";
import { getUsMarketStatus } from "@/lib/marketHours";
import SignalBadge from "./SignalBadge";
import RsiBar from "./RsiBar";

type SortKey = keyof Stock;

interface ScreenerProps {
  stocks: Stock[];
  onSelect: (ticker: string) => void;
  selectedTicker: string;
  onResolveSymbol: (ticker: string) => Promise<void>;
  dataMessage?: string;
}

export default function Screener({ stocks, onSelect, selectedTicker, onResolveSymbol, dataMessage }: ScreenerProps) {
  const [sortKey, setSortKey] = useState<SortKey>("ticker");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [filter, setFilter] = useState<"all" | Signal>("all");
  const [search, setSearch] = useState("");
  const [nowTs, setNowTs] = useState<number>(0);
  const lookupDebounceRef = useRef<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    return stocks
      .filter((s) => {
        if (filter !== "all" && s.signal !== filter) return false;
        if (q) return s.ticker.includes(q) || s.name.toUpperCase().includes(q);
        return true;
      })
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "string") return (av as string).localeCompare(bv as string) * sortDir;
        return ((av as number) - (bv as number)) * sortDir;
      });
  }, [stocks, filter, search, sortKey, sortDir]);

  useEffect(() => {
    return () => {
      if (lookupDebounceRef.current !== null) {
        window.clearTimeout(lookupDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setNowTs(Date.now()), 0);
    const id = window.setInterval(() => setNowTs(Date.now()), 60_000);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(id);
    };
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);

    const q = value.trim().toUpperCase();
    if (!q) return;

    const match = stocks.find((s) => {
      if (filter !== "all" && s.signal !== filter) return false;
      return s.ticker.includes(q) || s.name.toUpperCase().includes(q);
    });

    if (match && match.ticker !== selectedTicker) {
      onSelect(match.ticker);
    }

    if (!match && /^[A-Z.\-]{3,12}$/.test(q)) {
      if (lookupDebounceRef.current !== null) {
        window.clearTimeout(lookupDebounceRef.current);
      }
      lookupDebounceRef.current = window.setTimeout(() => {
        void onResolveSymbol(q);
      }, 300);
    }
  };

  const marketStatus = useMemo(() => getUsMarketStatus(new Date(nowTs)), [nowTs]);

  return (
    <section className="flex flex-1 flex-col overflow-hidden" aria-label="Market screener">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[var(--bg-secondary)] px-4 py-2.5">
        <h2 className="flex-1 text-[13px] font-medium">Market Screener</h2>

        {dataMessage ? <p className="text-[10px] tracking-[0.04em] text-[var(--amber)]">{dataMessage}</p> : null}

        <nav className="flex items-center gap-2" aria-label="Signal filter">
          {(["all", "buy", "hold", "sell"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                filter === f
                  ? "border-sky-400/40 bg-sky-400/10 text-[var(--accent)]"
                  : "border-white/15 bg-transparent text-[var(--text-muted)]"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </nav>

        <label className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1" aria-label="Search ticker">
          <Search size={13} color="rgba(255,255,255,0.3)" />
          <input
            type="text"
            placeholder="Search ticker..."
            value={search}
            onChange={(e) => {
              handleSearchChange(e.target.value);
            }}
            className="w-32 border-none bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-white/35"
          />
        </label>
      </header>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {([
                ["ticker", "Ticker"],
                ["name", "Name"],
                ["price", "Price"],
                ["change", "Change %"],
                ["volume", "Volume"],
                ["mktcap", "Mkt Cap"],
                ["rsi", "RSI"],
                ["signal", "Signal"],
              ] as [SortKey, string][]).map(([col, label]) => {
                const isActiveSort = sortKey === col;
                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className={`cursor-pointer select-none whitespace-nowrap border-b border-white/10 bg-[var(--bg-secondary)] px-3 py-2 text-left text-[10px] font-medium uppercase tracking-[0.08em] ${
                      isActiveSort ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                    }`}
                    scope="col"
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      {isActiveSort ? sortDir === 1 ? <ChevronUp size={11} /> : <ChevronDown size={11} /> : null}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const isPos = s.change >= 0;
              const sign = isPos ? "+" : "";
              const isSelected = s.ticker === selectedTicker;

              return (
                <tr
                  key={s.ticker}
                  onClick={() => onSelect(s.ticker)}
                  className={`cursor-pointer border-b border-white/5 ${isSelected ? "bg-sky-400/10" : "bg-transparent"}`}
                >
                  <td className="px-3 py-2.5 text-xs font-medium tracking-[0.04em] text-[var(--accent)]">{s.ticker}</td>
                  <td className="px-3 py-2.5 text-[11px] text-white/45">{s.name}</td>
                  <td className="px-3 py-2.5 text-xs">${s.price.toFixed(2)}</td>
                  <td className={`px-3 py-2.5 text-xs ${isPos ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                    {sign}
                    {s.change.toFixed(2)}%
                  </td>
                  <td className="px-3 py-2.5 text-xs text-white/50">{s.volume}</td>
                  <td className="px-3 py-2.5 text-xs text-white/50">{s.mktcap}</td>
                  <td className="min-w-[120px] px-3 py-2.5">
                    <RsiBar rsi={s.rsi} />
                  </td>
                  <td className="px-3 py-2.5">
                    <SignalBadge signal={s.signal} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="shrink-0 border-t border-white/10 bg-[var(--bg-secondary)] px-4 py-2" aria-label="Screener status">
        <ul className="flex items-center gap-5 text-[10px] tracking-[0.05em] text-white/35">
          <li>
            <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--green)]" aria-hidden />Live
          </li>
          <li>
            Results: <strong className="ml-1 text-[var(--text-primary)]">{filtered.length}</strong>
          </li>
          <li>
            Market:{" "}
            <strong className={`ml-1 ${marketStatus.isOpen ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
              {marketStatus.label}
            </strong>
          </li>
          <li>NYSE • NASDAQ • AMEX</li>
        </ul>
      </footer>
    </section>
  );
}
