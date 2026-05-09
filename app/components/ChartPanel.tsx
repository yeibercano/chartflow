"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

type Interval = "1min" | "5min" | "15min" | "1h" | "1day";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type CandlesResponse = {
  symbol: string;
  resolvedSymbol?: string;
  interval: Interval;
  source: "twelvedata" | "mock" | "error";
  message?: string;
  candles: Candle[];
};

interface ChartPanelProps {
  symbol: string;
}

const INTERVALS: Interval[] = ["1min", "5min", "15min", "1h", "1day"];

export default function ChartPanel({ symbol }: ChartPanelProps) {
  const [interval, setInterval] = useState<Interval>("15min");
  const [status, setStatus] = useState<string>("");
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      width: el.clientWidth,
      height: 330,
      layout: {
        background: { color: "#0d1120" },
        textColor: "rgba(255,255,255,0.65)",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.15)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.15)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: "rgba(56,189,248,0.45)" },
        horzLine: { color: "rgba(56,189,248,0.25)" },
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#34d399",
      downColor: "#f87171",
      borderUpColor: "#34d399",
      borderDownColor: "#f87171",
      wickUpColor: "#34d399",
      wickDownColor: "#f87171",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth });
    });

    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadCandles = async () => {
      try {
        const res = await fetch(`/api/market/candles?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=120`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = (await res.json()) as CandlesResponse;
        if (!active) return;

        const points: CandlestickData[] = data.candles.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        seriesRef.current?.setData(points);
        chartRef.current?.timeScale().fitContent();

        const last = points[points.length - 1];
        if (!last) {
          setStatus(`No candles for ${symbol}. ${data.message ?? "Unknown error"}`);
          return;
        }
        const src = data.source === "twelvedata" ? "Twelve Data" : data.source;
        const resolved = data.resolvedSymbol ? ` (${data.resolvedSymbol})` : "";
        setStatus(`Source: ${src}${resolved} • Candles: ${points.length} • Last: ${last.close.toFixed(2)}`);
      } catch {
        if (active) setStatus("Chart failed to load");
      }
    };

    void loadCandles();
    const id = window.setInterval(loadCandles, 5 * 60_000);

    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [symbol, interval]);

  const prettyInterval = useMemo(() => {
    const map: Record<Interval, string> = {
      "1min": "1m",
      "5min": "5m",
      "15min": "15m",
      "1h": "1h",
      "1day": "1D",
    };
    return map[interval];
  }, [interval]);

  return (
    <section className="shrink-0 border-b border-white/10 bg-[var(--bg-secondary)]" aria-label="Price chart">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
        <h3 className="text-sm font-medium tracking-[0.04em] text-[var(--text-primary)]">{symbol} Chart</h3>
        <p className="text-[11px] text-[var(--text-muted)]">Interval {prettyInterval}</p>
        <nav className="ml-auto flex items-center gap-1" aria-label="Chart interval">
          {INTERVALS.map((it) => (
            <button
              key={it}
              type="button"
              onClick={() => setInterval(it)}
              className={`rounded px-2 py-1 text-[10px] tracking-[0.04em] transition-colors ${
                interval === it ? "bg-sky-400/15 text-sky-300" : "bg-white/5 text-[var(--text-muted)] hover:bg-white/10"
              }`}
            >
              {it === "1day" ? "1D" : it.replace("min", "m")}
            </button>
          ))}
        </nav>
      </header>

      <div className="px-3 py-3">
        <div ref={chartContainerRef} className="w-full overflow-hidden rounded-md border border-white/10" />
        <p className="mt-2 text-[10px] tracking-[0.03em] text-[var(--text-muted)]">{status}</p>
      </div>
    </section>
  );
}
