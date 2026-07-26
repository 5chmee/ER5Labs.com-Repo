// ---------------------------------------------------------------------------
// MARKET TICKER — the instruments shown in the strip at the top of the
// homepage. Add or remove a line to change the ticker.
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
