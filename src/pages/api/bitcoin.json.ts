import type { APIRoute } from 'astro';

// Serves the real header of the latest Bitcoin block, plus current network
// stats, so the mining demo can hash genuine data instead of invented data.
// Proxied here rather than called from the browser so the response can be
// cached at the edge and shared between visitors.
export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const headers = { 'User-Agent': 'Mozilla/5.0 (compatible; ER5Labs/1.0)' };
    const [blocksRes, rateRes] = await Promise.all([
      fetch('https://mempool.space/api/v1/blocks', { headers, signal: AbortSignal.timeout(6000) }),
      fetch('https://mempool.space/api/v1/mining/hashrate/3d', { headers, signal: AbortSignal.timeout(6000) }),
    ]);
    if (!blocksRes.ok) return new Response('{"error":"upstream"}', { status: 502 });

    const block = (await blocksRes.json())?.[0];
    if (!block) return new Response('{"error":"no block"}', { status: 502 });

    const rate = rateRes.ok ? await rateRes.json() : null;

    return new Response(
      JSON.stringify({
        height: block.height,
        id: block.id,
        version: block.version,
        previousblockhash: block.previousblockhash,
        merkle_root: block.merkle_root,
        timestamp: block.timestamp,
        bits: block.bits,
        nonce: block.nonce,
        difficulty: block.difficulty,
        networkHashrate: rate?.currentHashrate ?? null,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // A new block arrives roughly every 10 minutes.
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        },
      }
    );
  } catch {
    return new Response('{"error":"unreachable"}', { status: 502 });
  }
};
