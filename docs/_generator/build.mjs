// Builds every reference PDF in docs/.
//
// Usage:  node build.mjs
//
// Every file in ./content/ that default-exports a document spec becomes a PDF,
// written to the path given by its `out` field, relative to docs/.

import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { render } from './lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(here, '..');
const contentDir = path.join(here, 'content');

const files = readdirSync(contentDir).filter((f) => f.endsWith('.mjs')).sort();
if (!files.length) {
  console.log('No content files found in', contentDir);
  process.exit(0);
}

let built = 0;
for (const file of files) {
  const mod = await import(pathToFileURL(path.join(contentDir, file)).href);
  const spec = mod.default;
  if (!spec?.out || typeof spec.body !== 'function') {
    console.warn(`  skipped ${file}: missing "out" or "body"`);
    continue;
  }
  const outPath = path.join(docsRoot, spec.out);
  render(spec, outPath);
  console.log(`  built  ${spec.out}`);
  built++;
}
console.log(`\n${built} document${built === 1 ? '' : 's'} written to ${docsRoot}`);
