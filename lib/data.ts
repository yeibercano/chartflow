export type Signal = "buy" | "hold" | "sell";

export interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  mktcap: string;
  rsi: number;
  signal: Signal;
  sector: string;
  pe: number;
  high52: number;
  low52: number;
}

export const STOCKS: Stock[] = [
  { ticker: "NVDA", name: "NVIDIA Corp", price: 875.20, change: 3.42, volume: "48.2M", mktcap: "$2.15T", rsi: 68, signal: "buy", sector: "Technology", pe: 65.2, high52: 974.00, low52: 408.50 },
  { ticker: "AAPL", name: "Apple Inc", price: 189.45, change: 0.87, volume: "62.1M", mktcap: "$2.94T", rsi: 54, signal: "hold", sector: "Technology", pe: 31.4, high52: 198.23, low52: 164.08 },
  { ticker: "MSFT", name: "Microsoft Corp", price: 415.30, change: 1.24, volume: "21.4M", mktcap: "$3.08T", rsi: 61, signal: "buy", sector: "Technology", pe: 36.8, high52: 430.82, low52: 309.45 },
  { ticker: "TSLA", name: "Tesla Inc", price: 178.90, change: -2.15, volume: "95.3M", mktcap: "$569B", rsi: 38, signal: "sell", sector: "Automotive", pe: 45.1, high52: 299.29, low52: 138.80 },
  { ticker: "META", name: "Meta Platforms", price: 507.80, change: 2.10, volume: "18.7M", mktcap: "$1.30T", rsi: 65, signal: "buy", sector: "Technology", pe: 27.3, high52: 531.49, low52: 279.40 },
  { ticker: "AMZN", name: "Amazon.com Inc", price: 186.50, change: 0.43, volume: "33.8M", mktcap: "$1.94T", rsi: 57, signal: "hold", sector: "Consumer", pe: 42.6, high52: 201.20, low52: 118.35 },
  { ticker: "GOOGL", name: "Alphabet Inc", price: 175.20, change: 1.66, volume: "24.9M", mktcap: "$2.18T", rsi: 59, signal: "hold", sector: "Technology", pe: 25.9, high52: 181.38, low52: 120.21 },
  { ticker: "JPM", name: "JPMorgan Chase", price: 198.30, change: -0.38, volume: "9.2M", mktcap: "$571B", rsi: 47, signal: "hold", sector: "Finance", pe: 11.8, high52: 210.45, low52: 138.76 },
  { ticker: "AMD", name: "Adv Micro Devices", price: 152.60, change: 4.18, volume: "55.1M", mktcap: "$247B", rsi: 71, signal: "buy", sector: "Technology", pe: 288.0, high52: 227.30, low52: 96.96 },
  { ticker: "NFLX", name: "Netflix Inc", price: 638.40, change: -1.02, volume: "5.4M", mktcap: "$277B", rsi: 44, signal: "sell", sector: "Media", pe: 43.2, high52: 700.99, low52: 344.73 },
  { ticker: "BA", name: "Boeing Co", price: 175.80, change: -1.73, volume: "11.2M", mktcap: "$108B", rsi: 33, signal: "sell", sector: "Aerospace", pe: 0, high52: 267.54, low52: 159.70 },
  { ticker: "DIS", name: "Walt Disney Co", price: 112.20, change: 0.62, volume: "8.9M", mktcap: "$205B", rsi: 52, signal: "hold", sector: "Media", pe: 72.4, high52: 123.74, low52: 78.73 },
  { ticker: "GS", name: "Goldman Sachs", price: 448.70, change: -0.55, volume: "3.1M", mktcap: "$146B", rsi: 49, signal: "hold", sector: "Finance", pe: 14.2, high52: 467.31, low52: 295.50 },
  { ticker: "SHOP", name: "Shopify Inc", price: 72.40, change: 5.22, volume: "22.6M", mktcap: "$93B", rsi: 73, signal: "buy", sector: "Technology", pe: 80.4, high52: 91.77, low52: 40.00 },
];

export const WATCHLIST_DEFAULT = ["NVDA", "AAPL", "MSFT", "TSLA", "META"];
