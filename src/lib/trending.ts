import { instruments } from '../data/markets';

// Works out which companies are being watched today, by merging what Yahoo
// Finance readers are looking up with what the retail forums are talking
// about. Used by both /api/trending.json and /api/markets.json.

export const MAX = 8;
const CANDIDATES = 14; // a few spares, since not every symbol resolves

// Symbols end up in the page, so anything failing this never gets through.
export const SYMBOL = /^[A-Z][A-Z0-9.-]{0,5}$/;

const get = (url: string) =>
  fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ER5Labs/1.0)' },
    signal: AbortSignal.timeout(6000),
  })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

const fromYahoo = async (): Promise<string[]> => {
  const json = await get('https://query1.finance.yahoo.com/v1/finance/trending/US?count=25');
  const quotes = json?.finance?.result?.[0]?.quotes;
  return Array.isArray(quotes) ? quotes.map((q: any) => String(q?.symbol || '').toUpperCase()) : [];
};

// Apewisdom counts mentions across Reddit's investing boards and Stocktwits,
// which is the closest thing to a public read on forum chatter.
const fromForums = async (): Promise<string[]> => {
  const json = await get('https://apewisdom.io/api/v1.0/filter/all-stocks/page/1');
  const rows = json?.results;
  return Array.isArray(rows) ? rows.map((r: any) => String(r?.ticker || '').toUpperCase()) : [];
};

// Borda count: a symbol scores for sitting near the top of a list, and scores
// again for appearing in both, so something Yahoo readers and the forums are
// each watching outranks something only one of them is.
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
  sources: { yahoo: number; forums: number };
  symbols: string[];
};

// Held for the life of the running instance, so a warm one does not ask the
// upstream sources again for the same day.
let memo: Trending | null = null;

export const trending = async (): Promise<Trending> => {
  const day = new Date().toISOString().slice(0, 10);
  if (memo?.day === day) return memo;

  const [yahoo, forums] = await Promise.all([fromYahoo(), fromForums()]);
  const ranked = rank([yahoo, forums]).slice(0, CANDIDATES);

  // If both sources are unreachable, the ticker falls back to the fixed list
  // rather than emptying out.
  const fallback = instruments.map((i) => i.symbol);
  const result: Trending = {
    day,
    sources: { yahoo: yahoo.length, forums: forums.length },
    symbols: ranked.length >= MAX ? ranked : [...ranked, ...fallback],
  };

  // Only remember a result that actually came from the sources, so a blip
  // does not pin the fallback list in place for the rest of the day.
  if (ranked.length >= MAX) memo = result;
  return result;
};
