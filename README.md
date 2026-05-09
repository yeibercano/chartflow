# ChartFlow

A professional stock screener and technical analysis platform — a TradingView-inspired app built with Next.js + TypeScript.

## Features
- 📊 Stock screener with sortable columns
- 👀 Watchlist with price & change tracking
- 🎯 Buy/Hold/Sell signal badges
- 📈 RSI momentum bars
- 🔍 Live search & signal filtering

## Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS-in-JS (inline styles)
- **Icons**: Lucide React
- **Deploy**: Vercel

## Getting Started

```bash
npm install
cp .env.example .env.local
# set TWELVE_DATA_API_KEY in .env.local
npm run dev
```

## Auth Setup (Google + GitHub)

1. Add these in `.env.local`:
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `AUTH_GITHUB_ID`
   - `AUTH_GITHUB_SECRET`
2. Create OAuth apps:
   - Google redirect URI: `http://localhost:3000/api/auth/callback/google`
   - GitHub callback URL: `http://localhost:3000/api/auth/callback/github`
3. Start app and open `/login`.

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub
2. Import on [vercel.com/new](https://vercel.com/new)
3. Click Deploy — zero config needed

## Roadmap
- [ ] Candlestick chart with TradingView Lightweight Charts
- [x] Real market data via Twelve Data free API
- [ ] Price alerts
- [ ] Portfolio tracker
- [ ] Technical indicators (MACD, Bollinger Bands)
