import { instruments, type Instrument } from '../data/markets';
import { trending, MAX, SYMBOL } from './trending';
import { cached, fetchJson, finite } from './http';

// The day's quotes, shared by the markets endpoint and the markets pages.

export type Quote = {
  symbol: string;
  label: string;
  unit: Instrument['unit'];
  price: number;
  changePct: number | null;
};

// Instruments with a set name and format. Anything else shows as its symbol.
const known = new Map(instruments.map((i) => [i.symbol, i]));
export const labelFor = (symbol: string) => known.get(symbol)?.label ?? symbol;

// The shape a stock page URL may take. Membership of the tracked set is
// checked separately, so this only has to keep the value well formed.
export const PAGE_SYMBOL = /^[A-Z0-9^=.-]{1,12}$/;

const fetchQuote = async (item: Instrument): Promise<Quote | null> => {
  const data = await fetchJson(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.symbol)}` +
      `?range=1d&interval=1d`
  );
  const meta = data?.chart?.result?.[0]?.meta;
  const price = finite(meta?.regularMarketPrice);
  if (price === null) return null;

  const prev = finite(meta?.chartPreviousClose ?? meta?.previousClose);
  const changePct = prev ? finite(((price - prev) / prev) * 100) : null;
  return { symbol: item.symbol, label: item.label, unit: item.unit, price, changePct };
};

// Today's line-up plus the fixed instruments. Stock pages exist only for
// these, which keeps the set of pages, and the upstream calls behind them,
// small and known.
export const trackedSymbols = async (): Promise<string[]> => {
  const today = await trending();
  const picked = today.symbols.filter((s) => SYMBOL.test(s));
  return [...new Set([...picked, ...instruments.map((i) => i.symbol)])];
};

// An empty batch is retried sooner than a good one is refreshed.
export const quotes = cached(
  (r: { items: Quote[] }) => (r.items.length ? 60_000 : 15_000),
  async () => {
    // Over-fetch, keep the first MAX that resolve. A dead symbol costs a
    // slot, not a gap.
    const wanted: Instrument[] = (await trackedSymbols())
      .slice(0, MAX + 6)
      .map((symbol) => known.get(symbol) ?? { symbol, label: symbol, unit: 'price' });

    const results = await Promise.all(wanted.map(fetchQuote));
    return {
      items: results.filter((q): q is Quote => q !== null).slice(0, MAX),
      updated: Date.now(),
    };
  }
);
