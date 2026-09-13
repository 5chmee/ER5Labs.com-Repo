// Shared plumbing for the API routes: bounded upstream fetches, JSON
// responses with explicit caching, and request coalescing.

const UA = 'Mozilla/5.0 (compatible; ER5Labs/1.0)';
const MAX_BYTES = 1_000_000;

export const NO_STORE = 'no-store';

// Reads at most `limit` bytes, so an upstream that misbehaves cannot make the
// function buffer an unbounded body.
const readCapped = async (res: Response, limit: number): Promise<string | null> => {
  if (Number(res.headers.get('content-length')) > limit || !res.body) {
    await res.body?.cancel();
    return null;
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.byteLength;
  }
  return new TextDecoder().decode(out);
};

// Any failure (timeout, non-2xx, oversize, bad JSON) comes back as null.
export const fetchJson = async (url: string, ms = 6000): Promise<any> => {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      signal: AbortSignal.timeout(ms),
    });
    if (!res.ok) {
      await res.body?.cancel();
      return null;
    }
    const text = await readCapped(res, MAX_BYTES);
    return text === null ? null : JSON.parse(text);
  } catch {
    return null;
  }
};

// Same limits as fetchJson, for feeds that are not JSON (RSS).
export const fetchText = async (url: string, ms = 6000): Promise<string | null> => {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml' },
      signal: AbortSignal.timeout(ms),
    });
    if (!res.ok) {
      await res.body?.cancel();
      return null;
    }
    return await readCapped(res, MAX_BYTES);
  } catch {
    return null;
  }
};

export const finite = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

export const json = (body: unknown, status: number, cache: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cache,
      'X-Content-Type-Options': 'nosniff',
    },
  });

// The edge cache is keyed on the URL, so a query string would let anyone
// skip it and hit the upstreams directly.
export const rejectQuery = (url: URL) =>
  url.search ? json({ error: 'no query parameters' }, 400, NO_STORE) : null;

// Per-visitor limit on requests that reach the function. Most requests are
// answered by the edge cache and never get here; this caps what is left.
// Serverless instances do not share memory, so it is a per-instance floor,
// with the Vercel Firewall rule (Step 3) as the global limit.
const WINDOW_MS = 60_000;
const LIMIT = 60;
const MAX_TRACKED = 5000;
const hits = new Map<string, { n: number; reset: number }>();

const limited = (ip: string) => {
  const now = Date.now();
  if (hits.size > MAX_TRACKED) {
    for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
    if (hits.size > MAX_TRACKED) hits.clear();
  }
  const h = hits.get(ip);
  if (!h || h.reset <= now) {
    hits.set(ip, { n: 1, reset: now + WINDOW_MS });
    return null;
  }
  if (++h.n <= LIMIT) return null;
  const res = json({ error: 'too many requests' }, 429, NO_STORE);
  res.headers.set('Retry-After', String(Math.ceil((h.reset - now) / 1000)));
  return res;
};

// The rate limit on its own, for server-rendered pages.
export const rateLimited = (ctx: { clientAddress: string }) => {
  let ip = 'unknown';
  try {
    ip = ctx.clientAddress || ip;
  } catch {
    // Not available in every runtime; fall back to one shared bucket.
  }
  return limited(ip);
};

// Every API route runs this first: no query strings, then the rate limit.
export const guard = (ctx: { url: URL; clientAddress: string }) => rejectQuery(ctx.url) ?? rateLimited(ctx);

// Holds a result for ttl(result) ms and shares one in-flight load between
// concurrent callers, so a burst of cache misses on one instance costs one
// round of upstream calls rather than one per request.
export const cached = <T>(ttl: (value: T) => number, load: () => Promise<T>) => {
  let value: T | undefined;
  let until = 0;
  let inflight: Promise<T> | null = null;

  return (): Promise<T> => {
    if (value !== undefined && Date.now() < until) return Promise.resolve(value);
    inflight ??= load()
      .then((v) => {
        value = v;
        until = Date.now() + ttl(v);
        return v;
      })
      .finally(() => {
        inflight = null;
      });
    return inflight;
  };
};
