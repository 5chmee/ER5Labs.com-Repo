// Stock and markets pages: live prices from the stream, and the rest of the
// report (reasons, news, forum figures) refreshed once a minute while the tab
// is visible. The refresh fetches this same page, which the edge caches for
// 60 seconds, and swaps in the new #report. The markup is the server's own,
// already escaped, and parsed markup never runs scripts.

import { liveQuotes } from './live-quotes.js';

const REFRESH_MS = 60_000;
const root = document.getElementById('report');

if (root) {
  const live = liveQuotes(document.getElementById('main') || document.body);
  let timer = 0;
  let busy = false;
  let at = Date.now();

  const refresh = async () => {
    clearTimeout(timer);
    if (document.hidden || busy) return;
    busy = true;
    try {
      const res = await fetch(location.pathname, {
        credentials: 'same-origin',
        headers: { Accept: 'text/html' },
        signal: AbortSignal.timeout ? AbortSignal.timeout(10_000) : undefined,
      });
      if (res.ok) {
        const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        const next = doc.getElementById('report');
        const current = document.getElementById('report');
        if (next && current) {
          current.replaceWith(document.importNode(next, true));
          live.refreshed();
        }
      }
    } catch {
      // Keep what is on screen and try again next time.
    }
    busy = false;
    at = Date.now();
    timer = setTimeout(refresh, REFRESH_MS);
  };

  timer = setTimeout(refresh, REFRESH_MS);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - at >= REFRESH_MS) refresh();
  });
}
