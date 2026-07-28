# ER5Labs reference documents

Plain-English write-ups of everything in this project: what was built, why, and
how. Written to be read before an interview or any conversation where the work
might come up. Each one ends with the questions most likely to follow.

## What is here

```
docs/
  00-Overview/         the site as a whole: stack, structure, design, deployment
  01-Code-Walkthrough/ learn the code from scratch, in three parts
  Projects/            one document per project
  Playground/          one document per experiment
  Reference/           source material, such as the original build guide
  _generator/          the tooling that produces the PDFs
```

**Start here if you want to understand the code itself.** The walkthrough
assumes you have never written a line, and teaches every concept through real
code from this project. Read the three parts in order.

| Document | Pages | Covers |
| --- | --- | --- |
| `01-Code-Walkthrough/Part-1-The-Three-Languages.pdf` | 11 | What a website is. HTML structure, CSS including the box model and the custom properties behind dark mode, JavaScript including the DOM, events, arrays and async |
| `01-Code-Walkthrough/Part-2-The-Tools.pdf` | 9 | Why plain files stop scaling. Node and npm, Astro components, build time versus browser, props, layouts, routing, TypeScript, Markdown, Git, deployment |
| `01-Code-Walkthrough/Part-3-The-Clever-Bits.pdf` | 9 | fetch and JSON, CORS and serverless functions, browser storage, IntersectionObserver, the Web Animations API, Web Workers, Web Crypto, WebSockets, SVG |

**Then the work itself.**

| Document | Pages | Covers |
| --- | --- | --- |
| `00-Overview/ER5Labs-Site-Overview.pdf` | 6 | The whole site: why Astro, how the folders work, the design system, performance, deployment |
| `Playground/Bitcoin-Mining-Game.pdf` | 9 | Proof of work, the statistics, the profitability model, Web Workers, hand-written SHA-256 |
| `Playground/Split-Flap-Toy.pdf` | 4 | The departure board mechanism, and the animation performance problem behind it |

## Adding a new document

The PDFs are generated, not hand-made, so they stay consistent and can be
rebuilt whenever the work changes.

1. Add a file to `_generator/content/`, copying an existing one as a template.
2. Set `out` to where the PDF should land, for example `Projects/My-Thing.pdf`.
3. Write the content using the helpers: `h1`, `h2`, `p`, `bullets`, `code`,
   `callout`, `kv`, `qa`, `small`, `pageBreak`.
4. Rebuild:

```bash
cd docs/_generator
npm install     # first time only
npm run build
```

Every content file is rebuilt, so correcting a fact once regenerates the PDF.

## Conventions worth keeping

- **Assume no prior knowledge.** Introduce each idea before using it.
- **Explain the why, not just the what.** The reasoning is what gets asked about.
- **Include what went wrong.** The bugs and the fixes are the most useful part
  to be able to talk about, and the most convincing.
- **End with likely questions**, each with the shape of a good answer.

## A note on scope

These documents only describe work whose code is in this repository. Anything
built elsewhere, such as client projects, needs its own write-up produced from
that codebase, since the details cannot be inferred from the outside.
