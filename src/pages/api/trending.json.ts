import type { APIRoute } from 'astro';
import { instruments } from '../../data/markets';

export const prerender = false;

// Picks the day's ticker line-up. Kept apart from the quotes endpoint on
// purpose: this response is cached at the edge for a full day, so the choice
// of companies settles once and then holds, while prices carry on refreshing
// every minute against the other route.

const MAX = 8;
const CANDIDATES = 14; // a few spares, since not every symbol resolves

// Symbols are pasted straight into the page by the ticker, so nothing that
// fails this pattern is allowed through. Letters, digits, dot and dash only.
const SYMBOL = /^[A-Z][A-Z0-9.-]{0,5}$/;

const get = (url: string) =>
  fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ER5Labs/1.0)' },
    signal: AbortSignal.timeout(6000),
  })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

// What Yahoo Finance readers are looking up right now.
const fromYahoo = async (): Promise<string[]> => {
  const json = await get('https://query1.finance.yahoo.com/v1/finance/trending/US?count=25');
  const quotes = json?.finance?.result?.[0]?.quotes;
  if (!Array.isArray(quotes)) return [];
  return quotes.map((q: any) => String(q?.symbol || '').toUpperCase());
};

// What the retail forums are talking about. Apewisdom counts mentions across
// Reddit's investing boards and Stocktwits, which is the closest thing to a
// public read on forum chatter.
const fromForums = async (): Promise<string[]> => {
  const json = await get('https://apewisdom.io/api/v1.0/filter/all-stocks/page/1');
  const rows = json?.results;
  if (!Array.isArray(rows)) return [];
  return rows.map((r: any) => String(r?.ticker || '').toUpperCase());
};

// Borda count: a symbol scores highest for being near the top of a list, and
// scores again for appearing in more than one. Something both Yahoo readers
// and the forums are watching therefore beats something only one of them is.
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

export const GET: APIRoute = async ({ url }) => {
  if (url.search) {
    return new Response('{"error":"no query parameters"}', {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  const [yahoo, forums] = await Promise.all([fromYahoo(), fromForums()]);
  const ranked = rank([yahoo, forums]).slice(0, CANDIDATES);

  // If both sources are unreachable, the ticker falls back to the fixed list
  // rather than emptying out.
  const fallback = instruments.map((i) => i.symbol);
  const symbols = ranked.length >= MAX ? ranked : [...ranked, ...fallback];

  return new Response(
    JSON.stringify({
      day: new Date().toISOString().slice(0, 10),
      sources: { yahoo: yahoo.length, forums: forums.length },
      symbols,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
      },
    }
  );
};
