# ER5Labs reference documents

Plain-English write-ups of everything in this project: what was built, why, and
how. Written to be read before an interview or any conversation where the work
might come up. Each one ends with the questions most likely to follow.

## What is here

```
docs/
  00-Overview/     the site as a whole: stack, structure, design, deployment
  Projects/        one document per project
  Playground/      one document per experiment
  Reference/       source material, such as the original build guide
  _generator/      the tooling that produces the PDFs
```

| Document | Covers |
| --- | --- |
| `00-Overview/ER5Labs-Site-Overview.pdf` | The whole site: why Astro, how the folders work, the design system, performance, deployment |
| `Playground/Bitcoin-Mining-Game.pdf` | Proof of work, the statistics, the profitability model, Web Workers, hand-written SHA-256 |
| `Playground/Split-Flap-Toy.pdf` | The departure board mechanism, and the animation performance problem behind it |

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
