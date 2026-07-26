// ---------------------------------------------------------------------------
// SKILLS — grouped by category. EASY TO EDIT: each group is
//   { category: 'Heading', items: ['A', 'B', ...] }
// Add a group by adding an object; add a skill by adding a string to `items`.
// Groups appear on the page in the order listed here — reorder freely.
// ---------------------------------------------------------------------------

export type SkillGroup = {
  category: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    category: 'Data analytics and statistics',
    items: ['Python', 'SQL', 'R & RStudio', 'IBM SPSS'],
  },
  {
    category: 'Data visualisation and BI',
    items: ['Tableau', 'Power BI', 'MS Excel'],
  },
  {
    category: 'Web and front-end',
    items: ['HTML', 'CSS', 'JavaScript', 'React', 'Astro'],
  },
  {
    category: 'Finance and investment analysis',
    items: [
      'Portfolio Restructuring',
      'Financial Modelling',
      'Databases',
      'Quantitative Analysis',
      'Equity Research',
      'Asset Allocation',
    ],
  },
  {
    category: 'Accounting and tax',
    items: ['Intuit QuickBooks', 'Sage', 'Xero', 'Clientbase CRM', 'Tally', 'WinMan'],
  },
  {
    category: 'Tools and workflow',
    items: ['Git', 'GitHub', 'VS Code / Cursor', 'Vercel'],
  },
  {
    category: 'Growing in',
    items: [
      'TypeScript',
      'LLM Integration',
      'Encryption',
      'Output Validation',
      'Authentication',
      'Java',
    ],
  },
];
