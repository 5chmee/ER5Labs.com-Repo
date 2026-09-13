// Live prices from Yahoo Finance's public price stream.
//
// The stream is a WebSocket that pushes a small protobuf message whenever a
// subscribed symbol trades. Only the fields the site shows are read: symbol
// (1), price (2), time (3) and percentage change (8). Everything received is
// treated as untrusted: frames are size-capped, the decoder stops on anything
// malformed, and a tick is only passed on for a symbol that was asked for,
// with a finite, positive price. Callers write values with textContent only.

const STREAM = 'wss://streamer.finance.yahoo.com/?version=2';
const MAX_FRAME = 4096;
const SYMBOL = /^[A-Z0-9^=.-]{1,12}$/;
const utf8 = new TextDecoder();

function decodePricing(b64) {
  let bytes;
  try {
    if (b64.length > MAX_FRAME) return null;
    const bin = atob(b64);
    bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
  const view = new DataView(bytes.buffer);
  const out = {};
  let i = 0;
  const varint = () => {
    let result = 0n;
    let shift = 0n;
    for (let n = 0; n < 10; n++) {
      if (i >= bytes.length) throw new Error('truncated');
      const b = bytes[i++];
      result |= BigInt(b & 0x7f) << shift;
      if (!(b & 0x80)) return result;
      shift += 7n;
    }
    throw new Error('varint too long');
  };
  try {
    while (i < bytes.length) {
      const key = Number(varint());
      const field = key >> 3;
      const wire = key & 7;
      if (wire === 0) {
        const raw = varint();
        if (field === 3) out.time = Number((raw >> 1n) ^ -(raw & 1n));
      } else if (wire === 5) {
        if (i + 4 > bytes.length) throw new Error('truncated');
        const f = view.getFloat32(i, true);
        i += 4;
        if (field === 2) out.price = f;
        else if (field === 8) out.changePct = f;
      } else if (wire === 1) {
        i += 8;
      } else if (wire === 2) {
        const len = Number(varint());
        if (i + len > bytes.length) throw new Error('truncated');
        if (field === 1) out.id = utf8.decode(bytes.subarray(i, i + len));
        i += len;
      } else {
        throw new Error('unsupported wire type');
      }
    }
  } catch {
    return null;
  }
  return out;
}

// Opens the stream for the given symbols and calls onTick({ symbol, price,
// changePct, time }) for each trade. Returns a function that closes it.
// Reconnects with backoff (2 s doubling to 60 s) if the connection drops.
export function openStream(symbols, onTick) {
  const wanted = new Set(symbols.filter((s) => typeof s === 'string' && SYMBOL.test(s)).slice(0, 30));
  if (!wanted.size || !('WebSocket' in window)) return () => {};

  let ws = null;
  let closed = false;
  let retry = 2000;
  let timer = 0;

  const handle = (b64) => {
    const t = decodePricing(b64);
    if (!t || !wanted.has(t.id) || !Number.isFinite(t.price) || t.price <= 0) return;
    onTick({
      symbol: t.id,
      price: t.price,
      changePct: Number.isFinite(t.changePct) ? t.changePct : null,
      time: Number.isFinite(t.time) && t.time > 0 ? t.time : Date.now(),
    });
  };

  const schedule = () => {
    if (closed) return;
    clearTimeout(timer);
    timer = setTimeout(connect, retry);
    retry = Math.min(retry * 2, 60_000);
  };

  function connect() {
    if (closed) return;
    try {
      ws = new WebSocket(STREAM);
    } catch {
      schedule();
      return;
    }
    ws.onopen = () => {
      retry = 2000;
      ws.send(JSON.stringify({ subscribe: [...wanted] }));
    };
    ws.onmessage = (e) => {
      if (typeof e.data !== 'string' || e.data.length > MAX_FRAME * 2) return;
      if (e.data[0] === '{') {
        let msg;
        try {
          msg = JSON.parse(e.data);
        } catch {
          return;
        }
        if (msg && msg.type === 'pricing' && typeof msg.message === 'string') handle(msg.message);
      } else {
        handle(e.data);
      }
    };
    ws.onclose = () => {
      ws = null;
      schedule();
    };
    ws.onerror = () => {
      try {
        if (ws) ws.close();
      } catch {
        // Already closing.
      }
    };
  }

  connect();
  return () => {
    closed = true;
    clearTimeout(timer);
    if (ws) {
      ws.onclose = null;
      try {
        ws.close();
      } catch {
        // Already closed.
      }
      ws = null;
    }
  };
}
