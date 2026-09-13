# ER5Labs

Personal site and portfolio for Emad Rafiq: [er5labs.com](https://er5labs.com).

Built with [Astro](https://astro.build) and deployed on Vercel. Every page is
prerendered to static HTML. Two routes run on demand because they need live
data: `/api/markets.json` for the ticker and `/api/bitcoin.json` for the mining
demo.

## Layout

```
src/pages/       one file per URL
src/layouts/     the shared page wrapper
src/components/  reusable pieces
src/data/        content, as plain lists the pages read
src/lib/         shared logic used by more than one route
src/pages/api/   the two on-demand routes
src/workers/     background thread code
scripts/         build tools run by hand
public/          served as-is
docs/            written reference material, and the generator that builds it
```

## Develop

```bash
npm install
npm run dev
```

The dev server prints a local URL, usually http://localhost:4321.

## Build

```bash
npm run build
```

Output goes to `dist/`. A build step strips HTML comments from the generated
pages, so maintenance notes stay in the source and out of what visitors receive.

## Icons

```bash
npm run icons
```

Regenerates `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` and the
manifest PNGs from the design constants in `scripts/build-icons.mjs`. Glyph
outlines are read out of the site typeface and written in as paths, so the mark
does not depend on fonts installed on the viewer's machine.

## Notes

Security headers and the content security policy live in `vercel.json`. The CSP
allows only the three origins the client actually contacts, so adding a new
external request means adding it there too.
