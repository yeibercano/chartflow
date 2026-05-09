"use client";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Watchlist from "./components/Watchlist";
import Screener from "./components/Screener";
import { STOCKS, WATCHLIST_DEFAULT, type Stock } from "@/lib/data";

export default function Home() {
  const [selectedTicker, setSelectedTicker] = useState("NVDA");
  const [stocks, setStocks] = useState<Stock[]>(STOCKS);
  const [dataMessage, setDataMessage] = useState<string>("");
  const [lookupMessage, setLookupMessage] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch("/api/market", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { stocks?: Stock[]; source?: string; message?: string };
        if (mounted && Array.isArray(data.stocks) && data.stocks.length > 0) {
          setStocks(data.stocks);
        }
        if (mounted) {
          setDataMessage(data.source === "mock" ? (data.message ?? "Using mock data") : "");
        }
      } catch {
        // Keep local fallback data if request fails.
      }
    };

    void load();
    const id = window.setInterval(load, 60_000);

    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  const handleResolveSymbol = async (symbol: string) => {
    try {
      const res = await fetch(`/api/market?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { stock?: Stock | null; message?: string };
      if (!data.stock) {
        setLookupMessage(data.message ?? `No match for ${symbol}`);
        return;
      }
      setLookupMessage("");

      setStocks((prev) => {
        if (prev.some((s) => s.ticker === data.stock!.ticker)) return prev;
        return [data.stock!, ...prev];
      });
      setSelectedTicker(data.stock.ticker);
    } catch {
      // No-op: keep current list on lookup failure.
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Watchlist
          stocks={stocks}
          watchlist={WATCHLIST_DEFAULT}
          selectedTicker={selectedTicker}
          onSelect={setSelectedTicker}
        />
        <Screener
          stocks={stocks}
          onSelect={setSelectedTicker}
          selectedTicker={selectedTicker}
          onResolveSymbol={handleResolveSymbol}
          dataMessage={lookupMessage || dataMessage}
        />
      </div>
    </div>
  );
}
