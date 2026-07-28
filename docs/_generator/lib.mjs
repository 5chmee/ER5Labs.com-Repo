// Shared PDF renderer for the ER5Labs reference documents.
//
// Content files describe a document as plain data (see ./content/*.mjs) and
// this turns it into a consistently styled PDF. Add a content file, run
// `npm run docs`, and a new PDF appears in the right folder.

import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';

const INK = '#1b1a17';
const MUTED = '#6b6459';
const ACCENT = '#a84f2c';
const RULE = '#d8d2c6';
const PANEL = '#f2efe8';

export function render(spec, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 62, bottom: 62, left: 62, right: 62 },
    info: { Title: spec.title, Author: 'Emad Rafiq', Subject: spec.subtitle ?? '' },
  });
  doc.pipe(fs.createWriteStream(outPath));
  const W = doc.page.width - 124;

  let pageNo = 0;
  const footer = () => {
    pageNo++;
    const y = doc.page.height - 42;
    // Writing inside the bottom margin would trigger another page, which fires
    // this handler again and recurses. Suspend the margin, and restore BOTH
    // cursors: doc.text(x, y) moves doc.x too, and leaving it at the page
    // number column makes every later paragraph start mid page.
    const keepBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    const sx = doc.x, sy = doc.y;
    doc.save();
    doc.font('Helvetica').fontSize(7.5).fillColor(MUTED);
    doc.text(spec.runningHead ?? spec.title, 62, y, { width: W / 2, lineBreak: false });
    doc.text(String(pageNo), 62 + W / 2, y, { width: W / 2, align: 'right', lineBreak: false });
    doc.restore();
    doc.page.margins.bottom = keepBottom;
    doc.x = sx;
    doc.y = sy;
  };
  doc.on('pageAdded', footer);

  const space = (n = 10) => doc.moveDown(n / 12);
  const need = (h) => { if (doc.y + h > doc.page.height - 80) doc.addPage(); };

  const api = {
    h1(t) {
      need(80); space(16);
      doc.font('Helvetica-Bold').fontSize(17).fillColor(INK).text(t, { width: W });
      doc.moveTo(62, doc.y + 5).lineTo(104, doc.y + 5).lineWidth(2).strokeColor(ACCENT).stroke();
      doc.y += 14;
    },
    h2(t) {
      need(60); space(12);
      doc.font('Helvetica-Bold').fontSize(11.5).fillColor(ACCENT).text(t, { width: W });
      space(4);
    },
    p(t) {
      need(40);
      doc.font('Helvetica').fontSize(10).fillColor(INK).text(t, { width: W, lineGap: 2.4 });
      space(7);
    },
    small(t) {
      need(30);
      doc.font('Helvetica-Oblique').fontSize(8.8).fillColor(MUTED).text(t, { width: W, lineGap: 2 });
      space(7);
    },
    bullets(items) {
      items.forEach((it) => {
        need(28);
        const y0 = doc.y;
        doc.circle(66, y0 + 5.2, 1.8).fillColor(ACCENT).fill();
        doc.font('Helvetica').fontSize(10).fillColor(INK).text(it, 76, y0, { width: W - 14, lineGap: 2.2 });
        space(4);
      });
      space(4);
    },
    code(lines) {
      const arr = Array.isArray(lines) ? lines : [lines];
      const h = arr.length * 12.5 + 16;
      need(h + 10);
      const y0 = doc.y;
      doc.roundedRect(62, y0, W, h, 3).fillColor('#241f1b').fill();
      doc.font('Courier').fontSize(8.8).fillColor('#e8e0d0');
      arr.forEach((l, i) => doc.text(l, 72, y0 + 8 + i * 12.5, { width: W - 20, lineBreak: false }));
      doc.y = y0 + h;
      doc.x = 62;
      space(9);
    },
    callout(title, body) {
      const bodyH = doc.heightOfString(body, { width: W - 32, lineGap: 2.2 });
      const h = bodyH + 34;
      need(h + 10);
      const y0 = doc.y;
      doc.roundedRect(62, y0, W, h, 3).fillColor(PANEL).fill();
      doc.rect(62, y0, 2.5, h).fillColor(ACCENT).fill();
      doc.font('Helvetica-Bold').fontSize(9).fillColor(ACCENT)
        .text(title.toUpperCase(), 78, y0 + 10, { width: W - 32, characterSpacing: 0.6 });
      doc.font('Helvetica').fontSize(9.5).fillColor(INK)
        .text(body, 78, y0 + 22, { width: W - 32, lineGap: 2.2 });
      doc.y = y0 + h;
      doc.x = 62;
      space(10);
    },
    kv(rows) {
      rows.forEach(([k, v]) => {
        need(26);
        const y0 = doc.y;
        doc.font('Helvetica-Bold').fontSize(9.2).fillColor(INK).text(k, 62, y0, { width: 128 });
        const yA = doc.y;
        doc.font('Helvetica').fontSize(9.2).fillColor(MUTED).text(v, 196, y0, { width: W - 134, lineGap: 1.8 });
        doc.y = Math.max(yA, doc.y);
        doc.x = 62;
        space(5);
      });
      space(4);
    },
    qa(pairs) {
      pairs.forEach(([q, a]) => {
        need(70);
        doc.font('Helvetica-Bold').fontSize(9.8).fillColor(INK).text(q, { width: W, lineGap: 1.8 });
        space(3);
        doc.font('Helvetica').fontSize(9.5).fillColor(MUTED).text(a, { width: W, lineGap: 2.2 });
        space(11);
      });
    },
    pageBreak() { doc.addPage(); },
  };

  // ---- cover ----
  footer();
  doc.x = 62;
  doc.y = 150;
  doc.font('Helvetica').fontSize(9.5).fillColor(ACCENT)
    .text(spec.eyebrow ?? 'E R 5 L A B S', { width: W, characterSpacing: 1.2 });
  space(16);
  doc.font('Helvetica-Bold').fontSize(spec.title.length > 34 ? 24 : 30).fillColor(INK)
    .text(spec.title, { width: W, lineGap: 2 });
  space(8);
  if (spec.subtitle) {
    doc.font('Helvetica').fontSize(13).fillColor(MUTED).text(spec.subtitle, { width: W, lineGap: 3 });
  }
  space(26);
  doc.moveTo(62, doc.y).lineTo(62 + W, doc.y).lineWidth(0.8).strokeColor(RULE).stroke();
  space(20);
  spec.intro.forEach((t) => api.p(t));
  if (spec.oneLiner) { space(10); api.callout('In one sentence', spec.oneLiner); }

  // ---- body ----
  spec.body(api);

  doc.end();
  return outPath;
}
