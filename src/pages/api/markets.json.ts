import type { APIRoute } from 'astro';
import { instruments, type Instrument } from '../../data/markets';

// Runs on demand (serverless) rather than being baked in at build time —
// the browser can't call Yahoo directly because of CORS, so we proxy it here.
export const prerender = false;

type Quote = {
  label: string;
  unit: Instrument['unit'];
  price: number;
  changePct: number | null;
};

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

export const GET: APIRoute = async () => {
  const results = await Promise.all(instruments.map(fetchQuote));
  const items = results.filter((q): q is Quote => q !== null);

  return new Response(JSON.stringify({ items, updated: Date.now() }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Cache at the edge so visitors share one upstream call per minute.
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
};
