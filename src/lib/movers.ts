import { cached, fetchJson, fetchText, finite } from './http';
import { labelFor } from './quotes';

// Builds the "why did it move" report for one tracked symbol from public
// sources: the price history (Yahoo Finance), recent headlines (Yahoo Finance
// and Google News RSS) and retail forum activity (Apewisdom, which counts
// mentions across Reddit and Stocktwits).
//
// The explanation is assembled from those numbers and headlines by fixed
// rules, and says what coincided with the move. It does not claim to know
// what caused it, and nothing is invented to fill a gap.

export type NewsItem = { title: string; source: string; url: string; time: number };
export type Reason = { text: string; refs: number[] };
export type Forum = {
  rank: number;
  rank24: number | null;
  mentions: number;
  mentions24: number | null;
  upvotes: number;
};
export type Report = {
  symbol: string;
  label: string;
  name: string;
  currency: string;
  exchange: string;
  price: number;
  changePct: number | null;
  marketTime: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  yearHigh: number | null;
  yearLow: number | null;
  volume: number | null;
  avgVolume: number | null;
  ret5d: number | null;
  ret1m: number | null;
  spyPct: number | null;
  forum: Forum | null;
  news: NewsItem[];
  reasons: Reason[];
  spark: number[];
  updated: number;
};

// ── parsing ──────────────────────────────────────────────────────────────

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

// Feed text to plain text. The page escapes everything on output, so this
// only has to produce readable strings, not safe ones.
const plain = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
      if (e[0] === '#') {
        const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : '';
      }
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const tag = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? plain(m[1]) : '';
};

// Only https links are kept, so a feed cannot put a javascript: or data: URL
// on the page.
const safeUrl = (raw: string) => {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
};

const parseRss = (xml: string | null): NewsItem[] => {
  if (!xml) return [];
  const out: NewsItem[] = [];
  for (const m of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    if (out.length >= 30) break;
    const item = m[1];
    const url = safeUrl(tag(item, 'link'));
    const time = Date.parse(tag(item, 'pubDate'));
    let title = tag(item, 'title').slice(0, 300);
    if (!url || !title || !Number.isFinite(time)) continue;
    const source = (tag(item, 'source') || new URL(url).hostname.replace(/^www\./, '')).slice(0, 80);
    // Google News appends " - Publisher" to every title.
    if (title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    out.push({ title, source, url, time });
  }
  return out;
};

// ── sources ──────────────────────────────────────────────────────────────

const chart = async (symbol: string) => {
  const data = await fetchJson(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=3mo&interval=1d`
  );
  const r = data?.chart?.result?.[0];
  const meta = r?.meta;
  const price = finite(meta?.regularMarketPrice);
  if (!meta || price === null) return null;

  const q = r?.indicators?.quote?.[0] ?? {};
  const series = (arr: unknown) => (Array.isArray(arr) ? arr.slice(-80).map((v) => finite(v)) : []);
  const text = (v: unknown, n: number) => (typeof v === 'string' ? plain(v).slice(0, n) : '');
  const closes = series(q.close);

  let changePct = finite(meta.regularMarketChangePercent);
  if (changePct === null) {
    const valid = closes.filter((v): v is number => v !== null);
    const prev = valid.length > 1 ? valid[valid.length - 2] : null;
    changePct = prev ? ((price - prev) / prev) * 100 : null;
  }

  return {
    price,
    changePct,
    name: text(meta.longName || meta.shortName, 120),
    currency: text(meta.currency, 8),
    exchange: text(meta.fullExchangeName || meta.exchangeName, 40),
    marketTime: finite(meta.regularMarketTime),
    dayHigh: finite(meta.regularMarketDayHigh),
    dayLow: finite(meta.regularMarketDayLow),
    yearHigh: finite(meta.fiftyTwoWeekHigh),
    yearLow: finite(meta.fiftyTwoWeekLow),
    volume: finite(meta.regularMarketVolume),
    closes,
    volumes: series(q.volume),
  };
};

// The S&P 500 move, so a stock's move can be split into market and stock.
const benchmark = cached(
  (v: number | null) => (v === null ? 15_000 : 60_000),
  async () => (await chart('SPY'))?.changePct ?? null
);

// Reddit and Stocktwits mention ranks for the 200 most discussed tickers.
const forums = cached(
  (m: Map<string, Forum>) => (m.size ? 5 * 60_000 : 60_000),
  async () => {
    const pages = await Promise.all(
      [1, 2].map((p) => fetchJson(`https://apewisdom.io/api/v1.0/filter/all-stocks/page/${p}`))
    );
    const num = (v: unknown) => (v === null || v === undefined || v === '' ? null : finite(Number(v)));
    const map = new Map<string, Forum>();
    for (const page of pages) {
      for (const row of Array.isArray(page?.results) ? page.results : []) {
        const ticker = String(row?.ticker ?? '').toUpperCase();
        const rank = num(row?.rank);
        const mentions = num(row?.mentions);
        if (!/^[A-Z][A-Z0-9.-]{0,5}$/.test(ticker) || rank === null || mentions === null || map.has(ticker)) continue;
        map.set(ticker, {
          rank,
          rank24: num(row.rank_24h_ago),
          mentions,
          mentions24: num(row.mentions_24h_ago),
          upvotes: num(row.upvotes) ?? 0,
        });
      }
    }
    return map;
  }
);

// ── the report ───────────────────────────────────────────────────────────

const pctText = (v: number) => `${Math.abs(v).toFixed(2)}%`;
const signed = (v: number) => `${v >= 0 ? 'up' : 'down'} ${pctText(v)}`;

const ago = (time: number) => {
  const mins = Math.max(1, Math.round((Date.now() - time) / 60_000));
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${Math.round(hours / 24)} days ago`;
};

const returnOver = (closes: (number | null)[], back: number) => {
  const valid = closes.filter((v): v is number => v !== null);
  if (valid.length <= back) return null;
  const start = valid[valid.length - 1 - back];
  const end = valid[valid.length - 1];
  return start ? ((end - start) / start) * 100 : null;
};

const load = async (symbol: string): Promise<Report | null> => {
  const label = labelFor(symbol);
  const query = `${label === symbol ? `${symbol} stock` : label} when:3d`;

  const [c, spyPct, forumMap, yahooXml, googleXml] = await Promise.all([
    chart(symbol),
    benchmark(),
    forums(),
    fetchText(`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`),
    fetchText(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-GB&gl=GB&ceid=GB:en`),
  ]);
  if (!c) return null;

  // Headlines from the last four days, newest first, with near-duplicates
  // (the same story syndicated under the same title) removed.
  const now = Date.now();
  const seen = new Set<string>();
  const news = [...parseRss(yahooXml), ...parseRss(googleXml)]
    .filter((n) => n.time >= now - 4 * 86_400_000 && n.time <= now + 3_600_000)
    .sort((a, b) => b.time - a.time)
    .filter((n) => {
      const key = n.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 80);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);

  const volumes = c.volumes.slice(0, -1).filter((v): v is number => v !== null && v > 0).slice(-63);
  const avgVolume = volumes.length >= 10 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : null;
  const ret5d = returnOver(c.closes, 5);
  const ret1m = returnOver(c.closes, 21);
  const forum = forumMap.get(symbol) ?? null;
  const name = c.name || label;
  const reasons: Reason[] = [];

  // 1. The move, split into market and stock.
  if (c.changePct !== null) {
    let text = `${name} is ${signed(c.changePct)} on the day.`;
    if (spyPct !== null && symbol !== 'SPY') {
      const gap = c.changePct - spyPct;
      text +=
        Math.abs(gap) < 0.5
          ? ` The S&P 500 is ${signed(spyPct)}, so most of this is the market moving as a whole rather than anything specific to the company.`
          : ` The S&P 500 is ${signed(spyPct)}, so about ${pctText(gap)} of the move is specific to this stock rather than the wider market.`;
    }
    reasons.push({ text, refs: [] });
  }

  // 2. Participation.
  if (avgVolume && c.volume && c.volume > 0) {
    const ratio = c.volume / avgVolume;
    const x = `${ratio.toFixed(1)} times`;
    reasons.push({
      text:
        ratio >= 1.5
          ? `Volume is ${x} its three-month daily average. Heavy trading like that usually means news or large orders are behind the move.`
          : ratio < 0.7
            ? `Volume is ${x} its three-month daily average, which is light. Few shares have changed hands, so the move has little conviction behind it so far.`
            : `Volume is ${x} its three-month daily average, close to normal.`,
      refs: [],
    });
  }

  // 3. Coverage.
  if (news.length) {
    const lastDay = news.filter((n) => n.time >= now - 86_400_000).length;
    const top = news.slice(0, 3);
    reasons.push({
      text:
        `${lastDay ? `${lastDay} ${lastDay === 1 ? 'story has' : 'stories have'} been published about it in the last 24 hours.` : 'Nothing has been published about it in the last 24 hours; the latest coverage is older.'}` +
        ` The most recent is "${top[0].title}" (${top[0].source}, ${ago(top[0].time)}).`,
      refs: top.map((_, i) => i),
    });
  } else {
    reasons.push({ text: 'No recent news coverage was found, which makes a company-specific story less likely.', refs: [] });
  }

  // 4. Retail attention.
  if (forum) {
    let text = `It is the number ${forum.rank} most mentioned ticker on Reddit and Stocktwits right now`;
    if (forum.rank24 !== null && forum.rank24 !== forum.rank) text += `, ${forum.rank24 > forum.rank ? 'up' : 'down'} from number ${forum.rank24} a day ago`;
    text += '.';
    if (forum.mentions24 && forum.mentions24 > 0) {
      const change = ((forum.mentions - forum.mentions24) / forum.mentions24) * 100;
      if (Math.abs(change) >= 25) {
        text += ` Mentions are ${change > 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(0)}% on the previous 24 hours, so retail attention is ${change > 0 ? 'building' : 'fading'}.`;
      }
    }
    reasons.push({ text, refs: [] });
  } else if (label === symbol) {
    reasons.push({
      text: 'It is not among the 200 most discussed tickers on Reddit and Stocktwits, so retail chatter is unlikely to be driving it.',
      refs: [],
    });
  }

  // 5. Where it sits.
  const context: string[] = [];
  if (ret5d !== null) context.push(`${signed(ret5d)} over five trading days`);
  if (ret1m !== null) context.push(`${signed(ret1m)} over a month`);
  if (c.yearHigh && c.price <= c.yearHigh) {
    const below = ((c.yearHigh - c.price) / c.yearHigh) * 100;
    context.push(below < 1 ? 'trading at its 52-week high' : `${pctText(below)} below its 52-week high`);
  }
  if (context.length) reasons.push({ text: `For context, it is ${context.join(', ')}.`, refs: [] });

  return {
    symbol,
    label,
    name,
    currency: c.currency,
    exchange: c.exchange,
    price: c.price,
    changePct: c.changePct,
    marketTime: c.marketTime,
    dayHigh: c.dayHigh,
    dayLow: c.dayLow,
    yearHigh: c.yearHigh,
    yearLow: c.yearLow,
    volume: c.volume,
    avgVolume,
    ret5d,
    ret1m,
    spyPct,
    forum,
    news,
    reasons,
    spark: c.closes.filter((v): v is number => v !== null).slice(-60),
    updated: now,
  };
};

// One cache per symbol. Callers only pass tracked symbols, so this stays small.
const reports = new Map<string, () => Promise<Report | null>>();
export const report = (symbol: string) => {
  let get = reports.get(symbol);
  if (!get) {
    get = cached((r: Report | null) => (r ? 60_000 : 15_000), () => load(symbol));
    reports.set(symbol, get);
  }
  return get();
};
