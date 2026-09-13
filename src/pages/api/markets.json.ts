import type { APIRoute } from 'astro';
import { instruments, type Instrument } from '../../data/markets';
import { trending, MAX, SYMBOL } from '../../lib/trending';
import { cached, fetchJson, finite, guard, json, NO_STORE } from '../../lib/http';

// Runs on demand. CORS blocks the browser from calling Yahoo directly.
export const prerender = false;

type Quote = {
  label: string;
  unit: Instrument['unit'];
  price: number;
  changePct: number | null;
};

// Instruments with a set name and format. Anything else shows as its symbol.
const known = new Map(instruments.map((i) => [i.symbol, i]));

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
  return { label: item.label, unit: item.unit, price, changePct };
};

// An empty batch is retried sooner than a good one is refreshed.
const quotes = cached(
  (r: { items: Quote[] }) => (r.items.length ? 60_000 : 15_000),
  async () => {
    // Called directly. A serverless function's request origin is not the
    // public one, so fetching our own /api/trending.json silently failed.
    const today = await trending();
    const picked = today.symbols.filter((s) => SYMBOL.test(s));
    const symbols = [...new Set([...picked, ...instruments.map((i) => i.symbol)])];

    // Over-fetch, keep the first MAX that resolve. A dead symbol costs a
    // slot, not a gap.
    const wanted: Instrument[] = symbols
      .slice(0, MAX + 6)
      .map((symbol) => known.get(symbol) ?? { symbol, label: symbol, unit: 'price' });

    const results = await Promise.all(wanted.map(fetchQuote));
    return {
      items: results.filter((q): q is Quote => q !== null).slice(0, MAX),
      updated: Date.now(),
    };
  }
);

export const GET: APIRoute = async (ctx) => {
  const bad = guard(ctx);
  if (bad) return bad;

  try {
    const body = await quotes();
    // Never let the edge cache an empty strip; the ticker keeps its
    // placeholders on a non-2xx.
    if (!body.items.length) return json({ error: 'upstream unavailable' }, 503, NO_STORE);
    // One upstream round a minute, shared across visitors.
    return json(body, 200, 'public, s-maxage=60, stale-while-revalidate=300');
  } catch {
    return json({ error: 'unavailable' }, 503, NO_STORE);
  }
};
