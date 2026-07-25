// ---------------------------------------------------------------------------
// SKILLS — grouped by category. EASY TO EDIT: each group is
//   { category: 'Heading', note: 'optional one-liner', items: ['A', 'B', ...] }
// Add a group by adding an object; add a skill by adding a string to `items`.
//
// The groups below are inferred from your current projects (the Secure AI tool
// and this site) — add, edit, or remove anything freely.
// ---------------------------------------------------------------------------

export type SkillGroup = {
  category: string;
  note?: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    category: 'Web & front-end',
    note: 'How I build and ship interfaces.',
    items: ['HTML', 'CSS', 'JavaScript', 'Astro', 'Responsive design'],
  },
  {
    category: 'AI',
    note: 'Putting language models to work, safely.',
    items: ['LLM integration', 'Prompt design', 'Output validation & accuracy'],
  },
  {
    category: 'Data & security',
    note: 'Keeping data private and protected.',
    items: ['Databases', 'Authentication', 'Encryption', 'Data privacy & compliance'],
  },
  {
    category: 'Tools & workflow',
    note: 'Day to day.',
    items: ['Git & GitHub', 'VS Code / Cursor', 'Vercel'],
  },
  {
    category: 'Growing in',
    note: 'Actively learning.',
    items: ['TypeScript', 'Design systems', 'Accessibility'],
  },
];
