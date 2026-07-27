// ---------------------------------------------------------------------------
// PLAYGROUND — every experiment gets its own page at /playground/<slug>.
// The first entry is treated as the latest and is the one embedded at the
// bottom of the homepage.
//
// TO ADD AN EXPERIMENT:
//   1. Build the component in src/components/experiments/
//   2. Add an entry to the top of the list below
//   3. Register the component in the DEMOS map, which lives in BOTH
//      src/pages/playground/[slug].astro and
//      src/components/LatestExperiment.astro
//      (Astro components can only be imported from .astro files, so the map
//       cannot live here.)
// ---------------------------------------------------------------------------

export type Experiment = {
  slug: string;
  title: string;
  tag: string;
  added: string;
  note: string;   // one line, shown on the Playground card
  intro: string;  // longer line, shown on the experiment's own page
};

export const experiments: Experiment[] = [
  {
    slug: 'bitcoin-mining-game',
    title: 'Bitcoin mining game',
    tag: 'Latest',
    added: 'July 2026',
    note: 'Hunt for a nonce whose SHA-256 hash starts with enough zeros, the puzzle real miners race to solve.',
    intro:
      'Proof of work, played by hand. Pick a difficulty and hunt for a nonce whose SHA-256 hash starts with enough zeros. The hashing is real, the coins are not: it runs only when you ask it to, at whatever share of your processor you choose.',
  },
  {
    slug: 'split-flap-toy',
    title: 'Split-flap toy',
    tag: 'CSS · JS',
    added: 'July 2026',
    note: 'Type anything and the tiles turn over to spell it, the same way the board does.',
    intro:
      'The same mechanism as the departure board at the top of every page. Type anything, up to ten characters, and the tiles turn over to spell it.',
  },
];

export const latest = experiments[0];
