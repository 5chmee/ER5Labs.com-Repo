import type { APIRoute } from 'astro';
import { cached, fetchJson, finite, guard, json, NO_STORE } from '../../lib/http';

// Latest block header plus network stats, so the mining demo hashes real
// data. Proxied for the same CORS and caching reasons as the market route.
export const prerender = false;

const HEX64 = /^[0-9a-f]{64}$/;
const hash = (v: unknown) => (typeof v === 'string' && HEX64.test(v) ? v : null);
const uint = (v: unknown) => (Number.isSafeInteger(v) && (v as number) >= 0 ? (v as number) : null);

const load = async () => {
  const api = 'https://mempool.space/api/v1';
  const [blocks, rate, adj, price] = await Promise.all([
    fetchJson(`${api}/blocks`),
    fetchJson(`${api}/mining/hashrate/3d`),
    fetchJson(`${api}/difficulty-adjustment`),
    fetchJson(`${api}/prices`),
  ]);

  const b = Array.isArray(blocks) ? blocks[0] : null;
  if (!b) return null;

  // Every header field is hashed by the demo, so all of them must be present
  // and well formed or the block is refused outright.
  const header = {
    height: uint(b.height),
    id: hash(b.id),
    version: uint(b.version),
    previousblockhash: hash(b.previousblockhash),
    merkle_root: hash(b.merkle_root),
    timestamp: uint(b.timestamp),
    bits: uint(b.bits),
    nonce: uint(b.nonce),
  };
  if (Object.values(header).some((v) => v === null)) return null;

  // The stats are optional: a missing one degrades to null, not an error.
  return {
    ...header,
    difficulty: finite(b.difficulty),
    networkHashrate: finite(rate?.currentHashrate),
    // Position within the current 2016-block epoch.
    retarget: adj
      ? {
          progressPercent: finite(adj.progressPercent),
          difficultyChange: finite(adj.difficultyChange),
          remainingBlocks: finite(adj.remainingBlocks),
          nextRetargetHeight: finite(adj.nextRetargetHeight),
          timeAvg: finite(adj.timeAvg),
          previousRetarget: finite(adj.previousRetarget),
        }
      : null,
    price: price ? { GBP: finite(price.GBP), USD: finite(price.USD) } : null,
  };
};

// Blocks arrive about every 10 minutes; a failure is retried after 15 s.
const latest = cached((v: Awaited<ReturnType<typeof load>>) => (v ? 120_000 : 15_000), load);

export const GET: APIRoute = async (ctx) => {
  const bad = guard(ctx);
  if (bad) return bad;

  try {
    const body = await latest();
    if (!body) return json({ error: 'upstream unavailable' }, 502, NO_STORE);
    return json(body, 200, 'public, s-maxage=120, stale-while-revalidate=600');
  } catch {
    return json({ error: 'unavailable' }, 502, NO_STORE);
  }
};
