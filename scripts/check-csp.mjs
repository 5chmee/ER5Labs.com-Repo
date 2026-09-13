// Runs after `astro build`. The CSP in vercel.json allows inline scripts only
// by hash, so if a dependency update changes one (Vercel Analytics and Speed
// Insights each inject one), the live site would silently lose it. This fails
// the build instead, and prints the hash that needs adding.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const STATIC = '.vercel/output/static';
const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
const csp = config.headers
  .flatMap((rule) => rule.headers)
  .find((h) => h.key === 'Content-Security-Policy')?.value ?? '';
const scriptSrc = csp.split(';').map((d) => d.trim()).find((d) => d.startsWith('script-src ')) ?? '';
const allowed = new Set(scriptSrc.match(/'sha256-[^']+'/g) ?? []);

const pages = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.html')) pages.push(path);
  }
};
walk(STATIC);

const missing = new Map();
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  if (/\sstyle="/.test(html)) missing.set(`style attribute in ${page}`, 'style-src has no unsafe-inline');
  for (const m of html.matchAll(/<style\b[^>]*>/g)) missing.set(`inline <style> in ${page}`, m[0]);
  for (const m of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    const hash = `'sha256-${createHash('sha256').update(m[1], 'utf8').digest('base64')}'`;
    if (!allowed.has(hash)) missing.set(hash, page);
  }
}

if (missing.size) {
  console.error('CSP check failed. vercel.json does not allow:');
  for (const [what, where] of missing) console.error(`  ${what}  (${where})`);
  process.exit(1);
}
console.log(`CSP check passed: ${pages.length} pages, ${allowed.size} inline script hashes allowed.`);
