// ---------------------------------------------------------------------------
// EXPERIENCE — career / work history. Newest first. Add an entry per role.
// (Empty for now — the résumé link on the Experience page covers this until
//  you add detailed roles here.)
// ---------------------------------------------------------------------------

export type Role = {
  period: string;      // e.g. "2026 — now"
  role: string;
  org: string;
  summary: string;
  tags?: string[];
};

export const experience: Role[] = [
  // Example — copy this shape when you're ready to add roles:
  // {
  //   period: '2026 — now',
  //   role: 'Your role',
  //   org: 'Company or project',
  //   summary: 'One or two sentences on what you did and achieved there.',
  //   tags: ['Tag'],
  // },
];
