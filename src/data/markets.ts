// Fallback line-up for the ticker, and the display names.
//
// The strip shows whatever is trending that day (see api/trending.json.ts).
// These stand in if both sources are unreachable, and any that do trend keep
// the name and formatting set here instead of showing as a bare symbol.
//
//   symbol  Yahoo Finance symbol; futures use "=F", indices start with "^"
//   unit    'price' renders 1,234.56, 'yield' renders 4.68%

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
