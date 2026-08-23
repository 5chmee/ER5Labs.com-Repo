import type { APIRoute } from 'astro';
import { trending } from '../../lib/trending';

export const prerender = false;

// Public view of the day's line-up. The work is in src/lib/trending.ts, which
// the quotes route calls directly; this route exists so the selection can be
// inspected on its own.
export const GET: APIRoute = async ({ url }) => {
  if (url.search) {
    return new Response('{"error":"no query parameters"}', {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  return new Response(JSON.stringify(await trending()), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
    },
  });
};
