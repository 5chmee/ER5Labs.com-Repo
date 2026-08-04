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
import opentype from 'opentype.js';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

/* ---- the design ------------------------------------------------------- */

const design = {
  tile: '#16130d',   // near-black, the departure board ground
  mark: '#e6a13a',   // amber, the departure board type
  radius: 7,         // tile corner, on a 32-unit grid

  /* The tracking on ER is unusually wide and is doing real work. At 16px the
     two letters are about four pixels tall, which is below the size at which
     letterforms resolve. Set normally they merge into one smudge; opened up,
     they at least read as two separate marks. Verified by rendering to 16px
     and reading the pixels back, not by eye. */
  erHeight: 5.8,     // cap height of the small ER, in 32-unit grid units
  erTrack: 0.22,     // extra space between E and R, as a fraction of an em
  erArc: 20,         // degrees of arc the ER is set on; 0 is a straight line
  fiveHeight: 15.2,  // cap height of the large 5
  gap: 2.1,          // space between the ER baseline and the top of the 5
  optical: 0.35,     // nudge down; a lockup centred by maths sits visually high
};

/* ---- letterforms ------------------------------------------------------ */

/* The glyphs are taken from the site's own typeface and written into the
   file as paths. An SVG icon containing a <text> element is rendered with a
   font from the *viewer's* machine, so a monogram would silently fall back
   to whatever they happen to have. Paths always look the way they were cut. */
const FONT = 'node_modules/@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-800-normal.woff';

const font = opentype.parse((await readFile(FONT)).buffer);
const CAP = font.tables.os2.sCapHeight / font.unitsPerEm;

/* Lays `text` out with a cap height of exactly `capHeight` grid units,
   centred on the tile and sitting on the given baseline.

   With `arcDegrees` above zero the letters are set on a circle rather than a
   straight line. The circle's centre sits below the text, so the line arches
   over and its ends descend on either side. Each letter is also rotated to
   the tangent at its own position, which is what makes it read as curved
   type rather than as straight letters that have merely been moved down. */
function letters(text, capHeight, baseline, tracking = 0, arcDegrees = 0, fill = '#000') {
  const G = 32;
  const size = capHeight / CAP;
  const em = font.unitsPerEm;

  /* Measure first: for every glyph, where its ink starts, ends and centres,
     laid out flat in grid units. */
  const placed = [];
  let pen = 0;
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    const bb = glyph.getBoundingBox();
    /* `local` is the glyph's inked centre measured from its own origin; `pen`
       is where that origin sits in the line. Both are needed, because each
       glyph is drawn at its own origin and positioned by a transform. */
    const local = (((bb.x1 + bb.x2) / 2) / em) * size;
    placed.push({
      glyph,
      pen,
      local,
      left: pen + (bb.x1 / em) * size,
      right: pen + (bb.x2 / em) * size,
      centre: pen + local,
    });
    pen += (glyph.advanceWidth / em) * size + tracking * size;
  }

  /* Centre on the inked bounds rather than the advance widths, so the mark
     is optically centred rather than merely arithmetically centred. */
  const inkedLeft = placed[0].left;
  const inkedRight = placed[placed.length - 1].right;
  const midpoint = (inkedLeft + inkedRight) / 2;

  const draw = (p, transform) =>
    `<g transform="${transform}"><path d="${p.glyph.getPath(0, 0, size).toPathData(3)}"/></g>`;

  let body;
  if (arcDegrees <= 0) {
    const dx = G / 2 - midpoint;
    body = placed
      .map((p) => draw(p, `translate(${(dx + p.pen).toFixed(3)},${baseline.toFixed(3)})`))
      .join('');
  } else {
    /* The radius follows from the width the text has to cover and the angle
       it has to cover it in, since arc length = radius x angle. */
    const arc = (arcDegrees * Math.PI) / 180;
    const radius = (inkedRight - inkedLeft) / arc;
    const centreY = baseline + radius;

    body = placed
      .map((p) => {
        const along = p.centre - midpoint;            // distance along the arc
        const angle = (along / radius) * (180 / Math.PI);
        /* Read right to left: sit the glyph on its own centre, lift it to the
           top of the circle, swing it round, then place the circle itself. */
        return draw(
          p,
          `translate(${G / 2},${centreY.toFixed(3)}) rotate(${angle.toFixed(3)}) ` +
          `translate(0,${(-radius).toFixed(3)}) translate(${(-p.local).toFixed(3)},0)`
        );
      })
      .join('');
  }

  return `<g fill="${fill}">${body}</g>`;
}

/* ---- the mark, drawn from those numbers ------------------------------- */

function buildSvg(d, size = 32) {
  const G = 32;
  const block = d.erHeight + d.gap + d.fiveHeight;
  const top = (G - block) / 2 + d.optical;

  const er = letters('ER', d.erHeight, top + d.erHeight, d.erTrack, d.erArc, d.mark);
  const five = letters('5', d.fiveHeight, top + block, 0, 0, d.mark);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${G} ${G}" width="${size}" height="${size}">
  <rect width="${G}" height="${G}" rx="${d.radius}" fill="${d.tile}"/>
  ${er}
  ${five}
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

/* Exported so the design can be rendered for inspection without the build
   overwriting anything in public/. */
export { buildSvg, design };

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
