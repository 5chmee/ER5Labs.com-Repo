// Keeps any element marked [data-sym] up to date from the price stream, for
// the home markets panel, the markets index and each stock page. The page's
// own markup is the starting point; this only changes numbers, never markup.
//
// Inside each [data-sym] element:
//   [data-px]    price text          (data-unit="yield" appends %)
//   [data-mv]    change text, class "mv up|down"
//   [data-time]  inside root, time of the last streamed trade
//
// The stream is open only while the tab is visible, and every update in a
// frame is written in one pass, so a busy market cannot slow the page.

import { openStream } from './yahoo-stream.js';

const fmt = (v, unit) =>
  v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (unit === 'yield' ? '%' : '');

export function liveQuotes(root) {
  const nodes = () => [...root.querySelectorAll('[data-sym]')];
  const pending = new Map();
  const last = new Map();
  let frame = 0;
  let close = null;
  let key = '';
  let stopped = false;

  const flush = () => {
    frame = 0;
    if (stopped || !root.isConnected) {
      pending.clear();
      return;
    }
    const all = nodes();
    let newest = 0;
    for (const t of pending.values()) {
      for (const node of all) {
        if (node.dataset.sym !== t.symbol) continue;
        const px = node.querySelector('[data-px]');
        const mv = node.querySelector('[data-mv]');
        if (px) {
          const before = Number(px.dataset.value);
          px.textContent = fmt(t.price, node.dataset.unit);
          px.dataset.value = String(t.price);
          if (Number.isFinite(before) && before !== t.price) {
            px.classList.remove('is-up', 'is-down');
            void px.offsetWidth;
            px.classList.add(t.price > before ? 'is-up' : 'is-down');
          }
        }
        if (mv && t.changePct !== null) {
          mv.className = 'mv ' + (t.changePct > 0 ? 'up' : t.changePct < 0 ? 'down' : '');
          mv.textContent = (t.changePct > 0 ? '▲ ' : t.changePct < 0 ? '▼ ' : '') + Math.abs(t.changePct).toFixed(2) + '%';
        }
      }
      if (t.streamed) newest = Math.max(newest, t.time);
    }
    const time = root.querySelector('[data-time]');
    if (time && newest) {
      time.textContent = new Date(newest).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    pending.clear();
  };

  const onTick = (t) => {
    if (stopped) return;
    const tick = { ...t, streamed: true };
    last.set(t.symbol, tick);
    pending.set(t.symbol, tick);
    if (!frame) frame = requestAnimationFrame(flush);
  };

  const closeStream = () => {
    if (close) close();
    close = null;
    key = '';
  };

  // Opens, keeps or replaces the connection to match the symbols currently on
  // the page, or closes it while the tab is hidden.
  const sync = () => {
    if (stopped) return;
    if (document.hidden) {
      closeStream();
      return;
    }
    const symbols = [...new Set(nodes().map((n) => n.dataset.sym))].sort();
    const next = symbols.join(',');
    if (next === key && close) return;
    closeStream();
    if (symbols.length) {
      close = openStream(symbols, onTick);
      key = next;
    }
  };

  document.addEventListener('visibilitychange', sync);
  sync();

  return {
    // Call after the markup has been replaced: re-subscribes if the symbols
    // changed, and puts back any streamed price newer than the new markup.
    refreshed() {
      if (stopped) return;
      sync();
      for (const t of last.values()) pending.set(t.symbol, t);
      if (pending.size && !frame) frame = requestAnimationFrame(flush);
    },
    stop() {
      stopped = true;
      closeStream();
      document.removeEventListener('visibilitychange', sync);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      pending.clear();
    },
  };
}
