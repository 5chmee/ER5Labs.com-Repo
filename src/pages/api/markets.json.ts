import type { APIRoute } from 'astro';
import { instruments, type Instrument } from '../../data/markets';
import { trending, MAX, SYMBOL } from '../../lib/trending';

// Runs on demand (serverless) rather than being baked in at build time —
// the browser can't call Yahoo directly because of CORS, so we proxy it here.
export const prerender = false;

type Quote = {
  label: string;
  unit: Instrument['unit'];
  price: number;
  changePct: number | null;
};

// The handful of instruments that keep their friendly name and formatting if
// they happen to trend. Everything else is a company, shown by its symbol.
const known = new Map(instruments.map((i) => [i.symbol, i]));

const fetchQuote = async (item: Instrument): Promise<Quote | null> => {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.symbol)}` +
    `?range=1d&interval=1d`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ER5Labs/1.0)' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    if (typeof price !== 'number') return null;

    const prev = meta.chartPreviousClose ?? meta.previousClose ?? null;
    const changePct =
      typeof prev === 'number' && prev !== 0 ? ((price - prev) / prev) * 100 : null;

    return { label: item.label, unit: item.unit, price, changePct };
  } catch {
    // One bad symbol shouldn't take the whole ticker down.
    return null;
  }
};

export const GET: APIRoute = async ({ url }) => {
  if (url.search) {
    return new Response('{"error":"no query parameters"}', {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  // Called directly rather than over HTTP. Asking our own /api/trending.json
  // meant relying on the request origin inside a serverless function, which is
  // not the public one, so the fetch failed and the ticker quietly fell back
  // to the fixed list.
  const today = await trending();
  const picked = today.symbols.filter((s) => SYMBOL.test(s));
  const symbols = [...new Set([...picked, ...instruments.map((i) => i.symbol)])];

  const wanted: Instrument[] = symbols.map(
    (symbol) => known.get(symbol) ?? { symbol, label: symbol, unit: 'price' }
  );

  // Quote more than are needed, then keep the first that actually resolve, so
  // a delisted or mistyped symbol costs a place rather than a gap.
  const results = await Promise.all(wanted.slice(0, MAX + 6).map(fetchQuote));
  const items = results.filter((q): q is Quote => q !== null).slice(0, MAX);

  return new Response(JSON.stringify({ items, updated: Date.now() }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Cache at the edge so visitors share one upstream call per minute.
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
};
