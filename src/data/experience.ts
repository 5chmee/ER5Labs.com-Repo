// ---------------------------------------------------------------------------
// EXPERIENCE — career / work history. Newest first. Add an entry per role.
// ---------------------------------------------------------------------------

export type Role = {
  period: string;      // e.g. "2026 — now"
  role: string;
  org: string;
  summary: string;
  tags?: string[];
};

export const experience: Role[] = [
  {
    period: '2026 — now',
    role: 'Founder & builder',
    org: 'ER5Labs',
    summary:
      'Building and running a growing set of personal web projects under one hub — from design and front-end to shipping and hosting.',
    tags: ['Web', 'Design', 'Self-directed'],
  },

  // ---- EXAMPLE — replace with your real roles, or delete ----
  {
    period: 'Year — Year',
    role: 'Your role',
    org: 'Company or project',
    summary: 'One or two sentences on what you did and what you achieved there.',
    tags: ['Tag'],
  },
];
