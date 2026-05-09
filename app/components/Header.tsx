"use client";
import { useEffect, useMemo, useState } from "react";
import { BarChart2, Bell, Settings, User } from "lucide-react";
import { getUsMarketStatus } from "@/lib/marketHours";

export default function Header() {
  const [nowTs, setNowTs] = useState<number>(0);

  useEffect(() => {
    const t = window.setTimeout(() => setNowTs(Date.now()), 0);
    const id = window.setInterval(() => setNowTs(Date.now()), 60_000);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(id);
    };
  }, []);

  const marketStatus = useMemo(() => getUsMarketStatus(new Date(nowTs)), [nowTs]);

  return (
    <header className="h-12 shrink-0 border-b border-white/10 bg-[var(--bg-secondary)] px-5">
      <div className="flex h-full items-center gap-6">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-[var(--accent)]" />
          <span className="text-sm font-medium tracking-[0.06em] text-[var(--text-primary)]">
            CHART<span className="text-[var(--accent)]">FLOW</span>
          </span>
        </div>

        <nav className="flex flex-1 gap-1" aria-label="Primary">
          {["Screener", "Charts", "Alerts", "Portfolio"].map((item, i) => (
            <button
              key={item}
              className={`rounded-md px-3 py-1 text-xs transition-colors ${
                i === 0 ? "bg-sky-400/10 text-[var(--accent)]" : "text-[var(--text-muted)]"
              }`}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <p className={`text-[11px] tracking-[0.04em] ${marketStatus.isOpen ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
            <span className="mr-1" aria-hidden>
              ●
            </span>
            MARKET {marketStatus.label}
          </p>
          {[Bell, Settings, User].map((Icon, i) => (
            <button
              key={i}
              className="flex cursor-pointer p-1 text-[var(--text-muted)]"
              type="button"
              aria-label="Header action"
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
