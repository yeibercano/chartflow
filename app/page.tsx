"use client";
import { useState } from "react";
import Header from "./components/Header";
import Watchlist from "./components/Watchlist";
import Screener from "./components/Screener";
import { STOCKS, WATCHLIST_DEFAULT } from "@/lib/data";

export default function Home() {
  const [selectedTicker, setSelectedTicker] = useState("NVDA");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Watchlist
          stocks={STOCKS}
          watchlist={WATCHLIST_DEFAULT}
          selectedTicker={selectedTicker}
          onSelect={setSelectedTicker}
        />
        <Screener
          stocks={STOCKS}
          onSelect={setSelectedTicker}
          selectedTicker={selectedTicker}
        />
      </div>
    </div>
  );
}
