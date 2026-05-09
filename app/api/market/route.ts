import { NextRequest, NextResponse } from "next/server";
import { STOCKS, formatLargeNumber, signalFromRsi, type Stock } from "@/lib/data";

const TWELVE_DATA_URL = "https://api.twelvedata.com/quote";
const QUOTE_CACHE_TTL_MS = 5 * 60 * 1000;

const quoteCache = new Map<string, { expiresAt: number; result: { quote?: TwelveQuote; error?: string } }>();

type TwelveQuote = {
  symbol?: string;
  close?: string;
  percent_change?: string;
  volume?: string;
  name?: string;
  exchange?: string;
  mic_code?: string;
  fifty_two_week?: {
    high?: string;
    low?: string;
  };
};

type TwelveError = {
  code?: number;
  message?: string;
  status?: string;
};

function toNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function mergeQuote(base: Stock, quote?: TwelveQuote): Stock {
  if (!quote) return base;

  const price = toNumber(quote.close) ?? base.price;
  const change = toNumber(quote.percent_change) ?? base.change;
  const volumeNum = toNumber(quote.volume);
  const high52 = toNumber(quote.fifty_two_week?.high) ?? base.high52;
  const low52 = toNumber(quote.fifty_two_week?.low) ?? base.low52;

  // Simple derived RSI proxy so signal chips remain dynamic without adding heavy indicator calls.
  const derivedRsi = Math.max(0, Math.min(100, 50 + change * 4));

  return {
    ...base,
    price,
    change,
    volume: volumeNum ? formatLargeNumber(volumeNum) : base.volume,
    high52,
    low52,
    rsi: derivedRsi,
    signal: signalFromRsi(derivedRsi),
  };
}

function buildStockFromQuote(symbol: string, quote: TwelveQuote): Stock {
  const price = toNumber(quote.close) ?? 0;
  const change = toNumber(quote.percent_change) ?? 0;
  const volumeNum = toNumber(quote.volume);
  const high52 = toNumber(quote.fifty_two_week?.high) ?? price;
  const low52 = toNumber(quote.fifty_two_week?.low) ?? price;
  const derivedRsi = Math.max(0, Math.min(100, 50 + change * 4));

  return {
    ticker: symbol.toUpperCase(),
    name: quote.name ?? symbol.toUpperCase(),
    price,
    change,
    volume: volumeNum ? formatLargeNumber(volumeNum) : "N/A",
    mktcap: "N/A",
    rsi: derivedRsi,
    signal: signalFromRsi(derivedRsi),
    sector: "Unknown",
    pe: 0,
    high52,
    low52,
  };
}

async function fetchQuote(
  symbol: string,
  apikey: string,
): Promise<{ quote?: TwelveQuote; error?: string }> {
  const cached = quoteCache.get(symbol);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const res = await fetch(
    `${TWELVE_DATA_URL}?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apikey)}&dp=2`,
    { next: { revalidate: 60 } },
  );

  if (!res.ok) {
    const result = { error: `HTTP ${res.status}` };
    quoteCache.set(symbol, { expiresAt: Date.now() + 30_000, result });
    return result;
  }
  const json = (await res.json()) as TwelveQuote & TwelveError;
  if (json.code || json.status === "error") {
    const result = { error: json.message ?? `Error code ${json.code ?? "unknown"}` };
    quoteCache.set(symbol, { expiresAt: Date.now() + 30_000, result });
    return result;
  }

  if (!json.close) {
    const result = { error: "No price data returned" };
    quoteCache.set(symbol, { expiresAt: Date.now() + 30_000, result });
    return result;
  }

  const result = { quote: json };
  quoteCache.set(symbol, { expiresAt: Date.now() + QUOTE_CACHE_TTL_MS, result });
  return result;
}

async function fetchQuoteWithVariants(symbol: string, apikey: string): Promise<{ quote?: TwelveQuote; error?: string }> {
  const raw = symbol.toUpperCase();
  const variants = [
    raw,
    `${raw}:NASDAQ`,
    `${raw}:NYSE`,
    `${raw}:AMEX`,
    `${raw}:ARCA`,
  ];

  let lastError = "Symbol not found";
  for (const candidate of variants) {
    const result = await fetchQuote(candidate, apikey);
    if (result.quote) return result;
    if (result.error) lastError = result.error;
  }

  return { error: lastError };
}

export async function GET(req: NextRequest) {
  const apikey = process.env.TWELVE_DATA_API_KEY;
  const symbolParam = req.nextUrl.searchParams.get("symbol")?.trim().toUpperCase();

  if (!apikey) {
    return NextResponse.json(
      { stocks: STOCKS, source: "mock", message: "TWELVE_DATA_API_KEY is not configured" },
      { status: 200 },
    );
  }

  try {
    if (symbolParam) {
      const local = STOCKS.find((s) => s.ticker === symbolParam);
      const { quote, error } = await fetchQuoteWithVariants(symbolParam, apikey);
      if (!quote) {
        return NextResponse.json(
          { stock: local ?? null, source: "mock", message: error ?? "Symbol not found" },
          { status: 200 },
        );
      }
      const stock = local ? mergeQuote(local, quote) : buildStockFromQuote(symbolParam, quote);
      return NextResponse.json({ stock, source: "twelvedata", updatedAt: new Date().toISOString() }, { status: 200 });
    }

    const quotes = await Promise.all(
      STOCKS.map(async (stock) => [stock.ticker, await fetchQuoteWithVariants(stock.ticker, apikey)] as const),
    );

    const quoteMap = new Map<string, TwelveQuote | undefined>(
      quotes.map(([ticker, result]) => [ticker, result.quote]),
    );
    const stocks = STOCKS.map((stock) => mergeQuote(stock, quoteMap.get(stock.ticker)));

    return NextResponse.json(
      { stocks, source: "twelvedata", updatedAt: new Date().toISOString() },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { stocks: STOCKS, source: "mock", message: "Failed to fetch market data" },
      { status: 200 },
    );
  }
}
