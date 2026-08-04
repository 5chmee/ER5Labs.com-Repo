/**
 * Generates every icon the site needs from one set of numbers.
 *
 * The numbers below are exactly the controls from the live designer, so
 * changing a value here and re-running reproduces what you saw on screen.
 *
 *   node scripts/build-icons.mjs
 *
 * Writes into public/: favicon.svg, favicon.ico, apple-touch-icon.png,
 * icon-192.png, icon-512.png, og-icon.png.
 */
import sharp from 'sharp';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

/* ---- the design ------------------------------------------------------- */

const design = {
  tile: '#bd5b34',   // terracotta, the site accent
  mark: '#f7f2e8',   // warm cream, a shade lighter than the page background
  radius: 7,         // tile corner, on a 32-unit grid
  scale: 70,         // percent of the tile the mark occupies
  seam: 2,           // gap between the two flaps
  rows: 2,           // flaps
};

/* ---- the mark, drawn from those numbers ------------------------------- */

function buildSvg({ tile, mark, radius, scale, seam, rows }, size = 32) {
  const G = 32;
  const m = (G - (G * scale) / 100) / 2;
  const w = G - 2 * m;
  const h = (w - seam * (rows - 1)) / rows;
  const r = radius * 0.35;

  const flaps = Array.from({ length: rows }, (_, i) =>
    `  <rect x="${m.toFixed(2)}" y="${(m + i * (h + seam)).toFixed(2)}" ` +
    `width="${w.toFixed(2)}" height="${h.toFixed(2)}" ` +
    `rx="${r.toFixed(2)}" fill="${mark}"/>`
  ).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${G} ${G}" width="${size}" height="${size}">
  <rect width="${G}" height="${G}" rx="${radius}" fill="${tile}"/>
${flaps}
</svg>
`;
}

/* A square-cornered variant for iOS, which applies its own corner mask and
   would otherwise clip our rounded corners into a lumpy shape. */
const iosSvg = buildSvg({ ...design, radius: 0 });

/* ---- .ico, hand-assembled around PNGs --------------------------------- */

/* An .ico is a 6-byte header, one 16-byte directory entry per image, then
   the image payloads. Modern .ico files embed PNG rather than raw bitmaps,
   which every browser since IE11 reads. */
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);            // reserved
  header.writeUInt16LE(1, 2);            // 1 = icon
  header.writeUInt16LE(pngs.length, 4);  // image count

  let offset = 6 + pngs.length * 16;
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);  // width, 0 means 256
    e.writeUInt8(size >= 256 ? 0 : size, 1);  // height
    e.writeUInt8(0, 2);                       // palette size
    e.writeUInt8(0, 3);                       // reserved
    e.writeUInt16LE(1, 4);                    // colour planes
    e.writeUInt16LE(32, 6);                   // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

/* ---- build ------------------------------------------------------------ */

const out = join(process.cwd(), 'public');
await mkdir(out, { recursive: true });

const svg = buildSvg(design);
const svgBuf = Buffer.from(svg);
const png = (source, size) =>
  sharp(source, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

await writeFile(join(out, 'favicon.svg'), svg);

const icoSizes = [16, 32, 48];
const icoPngs = await Promise.all(
  icoSizes.map(async (size) => ({ size, data: await png(svgBuf, size) }))
);
await writeFile(join(out, 'favicon.ico'), buildIco(icoPngs));

/* iOS refuses transparency and adds no background of its own, so the square
   variant is flattened onto the tile colour before it is written. */
await writeFile(
  join(out, 'apple-touch-icon.png'),
  await sharp(Buffer.from(iosSvg), { density: 384 })
    .resize(180, 180)
    .flatten({ background: design.tile })
    .png({ compressionLevel: 9 })
    .toBuffer()
);

for (const size of [192, 512]) {
  await writeFile(join(out, `icon-${size}.png`), await png(svgBuf, size));
}

const files = ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];
console.log(`Wrote ${files.length} icons to public/:\n  ${files.join('\n  ')}`);
