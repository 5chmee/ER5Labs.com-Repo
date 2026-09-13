import { instruments } from '../data/markets';
import { cached, fetchJson } from './http';

// The day's most-watched companies, merging Yahoo Finance lookups with
// retail forum mentions. Used by both API routes.

export const MAX = 8;
const CANDIDATES = 14; // a few spares, since not every symbol resolves

// Symbols reach the page unescaped, so nothing else gets through.
export const SYMBOL = /^[A-Z][A-Z0-9.-]{0,5}$/;

const symbolsFrom = (rows: unknown, key: string): string[] =>
  Array.isArray(rows)
    ? rows.slice(0, 100).map((r: any) => String(r?.[key] ?? '').toUpperCase())
    : [];

const fromYahoo = async () =>
  symbolsFrom(
    (await fetchJson('https://query1.finance.yahoo.com/v1/finance/trending/US?count=25'))
      ?.finance?.result?.[0]?.quotes,
    'symbol'
  );

// Apewisdom aggregates mentions across Reddit and Stocktwits.
const fromForums = async () =>
  symbolsFrom(
    (await fetchJson('https://apewisdom.io/api/v1.0/filter/all-stocks/page/1'))?.results,
    'ticker'
  );

// Borda count. Scoring position in both lists means a name has to appear in
// each to lead, which filters out single-source noise.
const rank = (lists: string[][]): string[] => {
  const score = new Map<string, number>();
  for (const list of lists) {
    const seen = new Set<string>();
    list.forEach((symbol, i) => {
      if (!SYMBOL.test(symbol) || seen.has(symbol)) return;
      seen.add(symbol);
      score.set(symbol, (score.get(symbol) || 0) + (list.length - i));
    });
  }
  return [...score.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([symbol]) => symbol);
};

export type Trending = {
  day: string;
  fallback: boolean;
  sources: { yahoo: number; forums: number };
  symbols: string[];
};

export const untilMidnightUTC = () => {
  const n = new Date();
  return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + 1) - n.getTime();
};

// A real line-up holds until the UTC day changes. A fallback is retried after
// ten minutes: long enough that an outage does not mean two upstream calls
// per request, short enough that one blip does not pin it for the day.
const FALLBACK_MS = 10 * 60_000;

export const trending = cached(
  (t: Trending) => (t.fallback ? FALLBACK_MS : untilMidnightUTC()),
  async (): Promise<Trending> => {
    const day = new Date().toISOString().slice(0, 10);
    const [yahoo, forums] = await Promise.all([fromYahoo(), fromForums()]);
    const ranked = rank([yahoo, forums]).slice(0, CANDIDATES);
    const fallback = ranked.length < MAX;

    return {
      day,
      fallback,
      sources: { yahoo: yahoo.length, forums: forums.length },
      symbols: fallback ? [...ranked, ...instruments.map((i) => i.symbol)] : ranked,
    };
  }
);
