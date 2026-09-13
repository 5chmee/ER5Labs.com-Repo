import type { APIRoute } from 'astro';
import { quotes } from '../../lib/quotes';
import { guard, json, NO_STORE } from '../../lib/http';

// Runs on demand. CORS blocks the browser from calling Yahoo directly.
export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  const bad = guard(ctx);
  if (bad) return bad;

  try {
    const body = await quotes();
    // Never let the edge cache an empty strip; the ticker keeps its
    // placeholders on a non-2xx.
    if (!body.items.length) return json({ error: 'upstream unavailable' }, 503, NO_STORE);
    // One upstream round a minute, shared across visitors. Prices in between
    // come straight from the price stream in the browser.
    return json(body, 200, 'public, s-maxage=60, stale-while-revalidate=300');
  } catch {
    return json({ error: 'unavailable' }, 503, NO_STORE);
  }
};
