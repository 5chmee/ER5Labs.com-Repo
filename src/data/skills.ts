// ---------------------------------------------------------------------------
// SKILLS — grouped by category. Edit freely; add or remove groups and items.
// ---------------------------------------------------------------------------

export type SkillGroup = {
  category: string;
  note?: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    category: 'Building',
    note: 'The core of what I make things with.',
    items: ['HTML', 'CSS', 'JavaScript'],
  },
  {
    category: 'Tools',
    note: 'Day-to-day workflow.',
    items: ['Git & GitHub', 'VS Code / Cursor', 'Astro'],
  },
  {
    category: 'Growing in',
    note: 'Actively learning.',
    items: ['TypeScript', 'Design systems', 'Accessibility'],
  },
];
