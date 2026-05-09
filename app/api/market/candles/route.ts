import { NextRequest, NextResponse } from "next/server";
import { STOCKS } from "@/lib/data";

const TWELVE_TIME_SERIES_URL = "https://api.twelvedata.com/time_series";
const CANDLES_CACHE_TTL_MS = 5 * 60 * 1000;

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type TwelveTimeSeriesValue = {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
};

type TwelveTimeSeriesResponse = {
  code?: number;
  status?: string;
  message?: string;
  values?: TwelveTimeSeriesValue[];
};

const ALLOWED_INTERVALS = new Set(["1min", "5min", "15min", "1h", "1day"]);
const candlesCache = new Map<string, { expiresAt: number; payload: unknown }>();

function parseDateTimeToUnixSeconds(datetime: string): number {
  const iso = datetime.includes("T") ? datetime : `${datetime.replace(" ", "T")}Z`;
  const ts = Math.floor(new Date(iso).getTime() / 1000);
  return Number.isFinite(ts) ? ts : 0;
}

function toNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function makeSeededRandom(seedText: string): () => number {
  let seed = 0;
  for (let i = 0; i < seedText.length; i += 1) {
    seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
  }
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
}

function generateMockCandles(symbol: string, interval: string, outputsize: number): Candle[] {
  const seed = STOCKS.find((s) => s.ticker === symbol)?.price ?? 100;
  const rand = makeSeededRandom(`${symbol}:${interval}:${outputsize}`);
  const now = Math.floor(Date.now() / 1000);
  const step = interval === "1day" ? 86400 : interval === "1h" ? 3600 : interval === "15min" ? 900 : interval === "5min" ? 300 : 60;

  const candles: Candle[] = [];
  let prevClose = seed;
  for (let i = outputsize - 1; i >= 0; i -= 1) {
    const time = now - i * step;
    const drift = Math.sin((outputsize - i) / 5) * 0.6;
    const noise = (rand() - 0.5) * 0.8;
    const open = prevClose;
    const close = Math.max(0.01, open + drift + noise);
    const high = Math.max(open, close) + rand() * 0.5;
    const low = Math.min(open, close) - rand() * 0.5;

    candles.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });

    prevClose = close;
  }

  return candles;
}

async function fetchTimeSeries(symbolCandidate: string, interval: string, outputsize: number, apikey: string) {
  const url = `${TWELVE_TIME_SERIES_URL}?symbol=${encodeURIComponent(symbolCandidate)}&interval=${encodeURIComponent(interval)}&outputsize=${outputsize}&apikey=${encodeURIComponent(apikey)}&timezone=UTC`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { ok: false as const, message: `HTTP ${res.status} from Twelve Data` };
  const json = (await res.json()) as TwelveTimeSeriesResponse;
  if (json.code || json.status === "error" || !json.values?.length) {
    return { ok: false as const, message: json.message ?? "No candles returned" };
  }
  return { ok: true as const, values: json.values };
}

async function fetchTimeSeriesWithVariants(symbol: string, interval: string, outputsize: number, apikey: string) {
  const variants = [symbol, `${symbol}:NASDAQ`, `${symbol}:NYSE`, `${symbol}:AMEX`, `${symbol}:ARCA`];
  let lastMessage = "No candles returned";

  for (const candidate of variants) {
    const result = await fetchTimeSeries(candidate, interval, outputsize, apikey);
    if (result.ok) return { ...result, resolvedSymbol: candidate };
    lastMessage = result.message;
  }

  return { ok: false as const, message: lastMessage };
}

export async function GET(req: NextRequest) {
  const symbol = (req.nextUrl.searchParams.get("symbol") ?? "NVDA").trim().toUpperCase();
  const intervalRaw = (req.nextUrl.searchParams.get("interval") ?? "15min").trim();
  const interval = ALLOWED_INTERVALS.has(intervalRaw) ? intervalRaw : "15min";
  const outputsize = Math.min(Math.max(Number(req.nextUrl.searchParams.get("outputsize") ?? "120"), 30), 300);
  const cacheKey = `${symbol}:${interval}:${outputsize}`;

  const apikey = process.env.TWELVE_DATA_API_KEY;
  if (!apikey) {
    return NextResponse.json(
      {
        symbol,
        interval,
        source: "mock",
        message: "TWELVE_DATA_API_KEY is not configured",
        candles: generateMockCandles(symbol, interval, outputsize),
      },
      { status: 200 },
    );
  }

  try {
    const cached = candlesCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.payload, { status: 200 });
    }

    const result = await fetchTimeSeriesWithVariants(symbol, interval, outputsize, apikey);
    if (!result.ok) {
      const payload = {
        symbol,
        interval,
        source: "mock",
        message: result.message ?? "Using mock candles",
        candles: generateMockCandles(symbol, interval, outputsize),
      };
      candlesCache.set(cacheKey, { expiresAt: Date.now() + 30_000, payload });
      return NextResponse.json(
        {
          ...payload,
        },
        { status: 200 },
      );
    }

    const candles = result.values
      .map((v) => ({
        time: parseDateTimeToUnixSeconds(v.datetime),
        open: toNumber(v.open),
        high: toNumber(v.high),
        low: toNumber(v.low),
        close: toNumber(v.close),
      }))
      .filter((c) => c.time > 0)
      .sort((a, b) => a.time - b.time);

    const payload = {
      symbol,
      resolvedSymbol: result.resolvedSymbol,
      interval,
      source: "twelvedata",
      updatedAt: new Date().toISOString(),
      candles,
    };
    candlesCache.set(cacheKey, { expiresAt: Date.now() + CANDLES_CACHE_TTL_MS, payload });
    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        symbol,
        interval,
        source: "mock",
        message: "Failed to fetch candles, using mock data",
        candles: generateMockCandles(symbol, interval, outputsize),
      },
      { status: 200 },
    );
  }
}
