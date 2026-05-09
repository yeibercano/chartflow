"use client";
import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { Stock, Signal } from "@/lib/data";
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

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    return stocks
      .filter(s => {
        if (filter !== "all" && s.signal !== filter) return false;
        if (q) {
          return s.ticker.includes(q) || s.name.toUpperCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (typeof av === "string") return (av as string).localeCompare(bv as string) * sortDir;
        return ((av as number) - (bv as number)) * sortDir;
      });
  }, [stocks, filter, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(1); }
  };

  const handleSearchChange = async (value: string) => {
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
      await onResolveSymbol(q);
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === 1 ? <ChevronUp size={11} /> : <ChevronDown size={11} />;
  };

  const thStyle = (col: SortKey): React.CSSProperties => ({
    padding: "8px 12px", fontSize: 10, fontWeight: 500,
    color: sortKey === col ? "var(--accent)" : "var(--text-muted)",
    letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "left",
    background: "var(--bg-secondary)", cursor: "pointer", whiteSpace: "nowrap",
    borderBottom: "0.5px solid var(--border)", userSelect: "none",
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
        borderBottom: "0.5px solid var(--border)", background: "var(--bg-secondary)", flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>Market Screener</span>
        {dataMessage ? (
          <span style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.04em" }}>{dataMessage}</span>
        ) : null}

        {(["all", "buy", "hold", "sell"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontSize: 11, padding: "4px 10px", borderRadius: 20, cursor: "pointer",
            border: "0.5px solid",
            borderColor: filter === f ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.12)",
            background: filter === f ? "rgba(56,189,248,0.12)" : "transparent",
            color: filter === f ? "var(--accent)" : "var(--text-muted)",
            fontFamily: "inherit", transition: "all 0.15s",
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: 6, padding: "5px 10px",
        }}>
          <Search size={13} color="rgba(255,255,255,0.3)" />
          <input
            type="text" placeholder="Search ticker..."
            value={search}
            onChange={(e) => { void handleSearchChange(e.target.value); }}
            style={{
              background: "none", border: "none", outline: "none",
              fontSize: 12, color: "var(--text-primary)", fontFamily: "inherit", width: 130,
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {([
                ["ticker", "Ticker"], ["name", "Name"], ["price", "Price"],
                ["change", "Change %"], ["volume", "Volume"], ["mktcap", "Mkt Cap"],
                ["rsi", "RSI"], ["signal", "Signal"],
              ] as [SortKey, string][]).map(([col, label]) => (
                <th key={col} style={thStyle(col)} onClick={() => handleSort(col)}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                    {label} <SortIcon col={col} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const isPos = s.change >= 0;
              const sign = isPos ? "+" : "";
              const isSelected = s.ticker === selectedTicker;
              return (
                <tr key={s.ticker} onClick={() => onSelect(s.ticker)} style={{
                  borderBottom: "0.5px solid rgba(255,255,255,0.04)",
                  cursor: "pointer",
                  background: isSelected ? "rgba(56,189,248,0.06)" : "transparent",
                }}>
                  <td style={{ padding: "9px 12px", fontSize: 12, fontWeight: 500, color: "var(--accent)", letterSpacing: "0.04em" }}>{s.ticker}</td>
                  <td style={{ padding: "9px 12px", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{s.name}</td>
                  <td style={{ padding: "9px 12px", fontSize: 12 }}>${s.price.toFixed(2)}</td>
                  <td style={{ padding: "9px 12px", fontSize: 12, color: isPos ? "var(--green)" : "var(--red)" }}>{sign}{s.change.toFixed(2)}%</td>
                  <td style={{ padding: "9px 12px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{s.volume}</td>
                  <td style={{ padding: "9px 12px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{s.mktcap}</td>
                  <td style={{ padding: "9px 12px", minWidth: 120 }}><RsiBar rsi={s.rsi} /></td>
                  <td style={{ padding: "9px 12px" }}><SignalBadge signal={s.signal} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div style={{
        padding: "8px 16px", borderTop: "0.5px solid var(--border)",
        display: "flex", alignItems: "center", gap: 20,
        background: "var(--bg-secondary)", flexShrink: 0,
      }}>
        {[
          <><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--green)", marginRight: 5, animation: "pulse 2s infinite" }} />Live</>,
          <>Results: <strong style={{ color: "var(--text-primary)", marginLeft: 4 }}>{filtered.length}</strong></>,
          <>Market: <strong style={{ color: "var(--green)", marginLeft: 4 }}>Open</strong></>,
          <>NYSE • NASDAQ • AMEX</>,
        ].map((item, i) => (
          <span key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>{item}</span>
        ))}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
