// Mining worker: runs the whole search off the main thread so the page stays
// smooth no matter how hard it is working.
//
// The SHA-256 below is written out longhand rather than using crypto.subtle,
// because subtle.digest is promise-based and awaiting it once per hash costs
// more than the hashing itself. A synchronous implementation lets the worker
// run a tight loop, which is roughly eight times faster, and blocking here is
// harmless precisely because it is not the main thread.
//
// Verified against the NIST vectors for "abc" and "", and against the real
// header of block 959,820, which it hashes to that block's real id.

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const rr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
const w = new Uint32Array(64);

function sha256(msg: Uint8Array): Uint8Array {
  const len = msg.length;
  const bitLen = len * 8;
  const blocks = (len + 9 + 63) >> 6;
  const p = new Uint8Array(blocks * 64);
  p.set(msg);
  p[len] = 0x80;
  const dv = new DataView(p.buffer);
  dv.setUint32(p.length - 4, bitLen >>> 0);
  dv.setUint32(p.length - 8, Math.floor(bitLen / 4294967296));

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  for (let b = 0; b < blocks; b++) {
    const off = b * 64;
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const a1 = w[i - 15], a2 = w[i - 2];
      const s0 = rr(a1, 7) ^ rr(a1, 18) ^ (a1 >>> 3);
      const s1 = rr(a2, 17) ^ rr(a2, 19) ^ (a2 >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b2 = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
      const maj = (a & b2) ^ (a & c) ^ (b2 & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b2; b2 = a; a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b2) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const odv = new DataView(out.buffer);
  odv.setUint32(0, h0); odv.setUint32(4, h1); odv.setUint32(8, h2); odv.setUint32(12, h3);
  odv.setUint32(16, h4); odv.setUint32(20, h5); odv.setUint32(24, h6); odv.setUint32(28, h7);
  return out;
}

const HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));
const toHexReversed = (u8: Uint8Array) => {
  let s = '';
  for (let i = u8.length - 1; i >= 0; i--) s += HEX[u8[i]];
  return s;
};

let header = new Uint8Array(80);
let view = new DataView(header.buffer);
let running = false;
let nonce = 0;
let stride = 1;
let zeros = 4;
let effort = 0.3;

const BATCH = 4000;

function run() {
  if (!running) return;
  const t0 = performance.now();
  let found: { nonce: number; hash: string } | null = null;
  let last = '';
  let done = 0;

  for (let i = 0; i < BATCH; i++) {
    view.setUint32(76, nonce >>> 0, true);
    const hash = toHexReversed(sha256(sha256(header)));
    last = hash;
    done++;
    let ok = true;
    for (let z = 0; z < zeros; z++) {
      if (hash.charCodeAt(z) !== 48) { ok = false; break; }
    }
    if (ok) { found = { nonce: nonce >>> 0, hash }; break; }
    nonce = (nonce + stride) >>> 0;
  }

  const dt = performance.now() - t0;
  self.postMessage({
    type: found ? 'found' : 'progress',
    hashes: done,
    ms: dt,
    nonce: nonce >>> 0,
    hash: found ? found.hash : last,
    foundNonce: found ? found.nonce : null,
  });

  if (found) { running = false; return; }
  nonce = (nonce + stride) >>> 0;

  // Duty-cycle so a visitor who asked for 30% of a core gets 30% of a core.
  const idle = effort >= 1 ? 0 : Math.min(500, Math.round((dt * (1 - effort)) / effort));
  setTimeout(run, idle);
}

self.onmessage = (e: MessageEvent) => {
  const m = e.data;
  if (m.type === 'start') {
    header = new Uint8Array(m.header);
    view = new DataView(header.buffer);
    nonce = m.startNonce >>> 0;
    stride = m.stride || 1;
    zeros = m.zeros;
    effort = m.effort;
    running = true;
    run();
  } else if (m.type === 'effort') {
    effort = m.effort;
  } else if (m.type === 'stop') {
    running = false;
  }
};
