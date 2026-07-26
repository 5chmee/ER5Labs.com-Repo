// ---------------------------------------------------------------------------
// SITE CONTENT — edit this file to change the homepage copy, the board's
// destinations, recent work, résumé link, and contact links.
// ---------------------------------------------------------------------------

export const profile = {
  name: 'Emad Rafiq',
  brand: 'ER5Labs',
  // One human sentence — keep it in your own voice.
  intro:
    "I'm Emad Rafiq. This is my personal portfolio website where I keep, build and post my digital projects and works under ER5Labs, a home base for everything I create, control and collaborate on.",
  // Short About shown on the homepage (each string is a paragraph).
  about: [
    'I am a Math and Finance student specializing in portfolio management and asset allocation, my core niche and passion. I actively manage a fund averaging 29.6% p.a. to date, backed by a strong foundation in logical thinking, data analysis, tax and accounting (including audits, filings and financial reporting).',
    'Alongside finance, I design and build websites for personal and client projects, continually expanding my programming and web development toolkit.',
  ],
  location: '',
};

// The departure board. Each row links to a section of the site.
export type Destination = {
  code: string;
  label: string;
  href: string;
  note: string;
};

// Each `note` is ALSO the one-line summary shown under that page's title
// (via noteFor below), so the board and the page can never drift apart.
export const destinations: Destination[] = [
  { code: 'ER 01', label: 'PROJECTS', href: '/projects', note: 'Work & personal projects' },
  { code: 'ER 02', label: 'SKILLS', href: '/skills', note: 'Tools & technologies' },
  { code: 'ER 03', label: 'EXPERIENCE', href: '/experience', note: 'Background, roles & qualifications' },
  { code: 'ER 04', label: 'ENTRIES', href: '/entries', note: 'Thoughts, notes & write-ups' },
  { code: 'ER 05', label: 'PLAYGROUND', href: '/playground', note: 'Experiments, demos & ideas' },
];

// The one-line summary under a page title — same text as that page's note on
// the board. Used by the section pages so the wording only lives in one place.
export const noteFor = (href: string): string =>
  destinations.find((d) => d.href === href)?.note ?? '';

// A few recent/current things surfaced on the homepage.
export const recent = [
  {
    title: 'Secure AI Processing Tool for Private files',
    note: "A private AI tool I'm building for a client's team.",
    href: '/projects/confidential-ai-tool',
    status: 'Live',
  },
  {
    title: 'ER5Labs.com',
    note: 'This site — updated whenever I ship something new.',
    href: '/projects/er5labs',
    status: 'Live',
  },
];

export const interests = ['Web & digital craft', 'Minimal, human design', 'Building in the open'];

// Résumé — drop your PDF at public/resume.pdf and this link will serve it.
export const resume = {
  url: '/resume.pdf',
  label: 'View my résumé (PDF)',
};

// Contact — shown in the footer on every page.
export const contact = {
  email: 'er5labs@outlook.com',
  linkedin: 'www.linkedin.com/in/emad-rafiq-5232b928a',
};
