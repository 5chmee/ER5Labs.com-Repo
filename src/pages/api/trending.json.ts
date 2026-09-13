import type { APIRoute } from 'astro';
import { trending, untilMidnightUTC } from '../../lib/trending';
import { guard, json, NO_STORE } from '../../lib/http';

export const prerender = false;

// Public view of the day's line-up. The work is in src/lib/trending.ts, which
// the quotes route calls directly; this route exists so the selection can be
// inspected on its own.
export const GET: APIRoute = async (ctx) => {
  const bad = guard(ctx);
  if (bad) return bad;

  try {
    const today = await trending();
    // The edge copy must not outlive the UTC day, and a fallback line-up is
    // only held briefly so the real one replaces it once the sources recover.
    const maxAge = today.fallback
      ? 300
      : Math.max(1, Math.min(3600, Math.floor(untilMidnightUTC() / 1000)));
    return json(today, 200, `public, s-maxage=${maxAge}, stale-while-revalidate=600`);
  } catch {
    return json({ error: 'unavailable' }, 503, NO_STORE);
  }
};
