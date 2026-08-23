// ---------------------------------------------------------------------------
// MARKET TICKER — the fallback line-up, and the friendly names.
//
// The strip normally shows whatever is trending that day, chosen by
// src/pages/api/trending.json.ts. This list does two jobs behind that:
//
//   1. If both trending sources are unreachable, the ticker shows these
//      instead of emptying out.
//   2. If one of these does trend, it keeps the name and formatting given
//      here rather than appearing as a bare symbol.
//
//   symbol — Yahoo Finance symbol (futures use "=F", indices start with "^")
//   label  — what the ticker shows
//   unit   — 'price' renders 1,234.56 · 'yield' renders 4.68%
// ---------------------------------------------------------------------------

export type Instrument = {
  symbol: string;
  label: string;
  unit: 'price' | 'yield';
};

export const instruments: Instrument[] = [
  { symbol: 'GC=F', label: 'Gold', unit: 'price' },
  { symbol: 'CL=F', label: 'Oil (WTI)', unit: 'price' },
  { symbol: '^GSPC', label: 'S&P 500', unit: 'price' },
  { symbol: '^NDX', label: 'Nasdaq 100', unit: 'price' },
  { symbol: '^N225', label: 'Nikkei 225', unit: 'price' },
  { symbol: 'NVDA', label: 'NVDA', unit: 'price' },
  { symbol: 'AMD', label: 'AMD', unit: 'price' },
  { symbol: '^TNX', label: 'US 10Y', unit: 'yield' },
];
