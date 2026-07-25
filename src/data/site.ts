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
    'ER5Labs is my personal brand for the projects I do, whether it is work I have done or participated in, personal pieces or passion projects.',
    'This board is the front door — pick a destination to see my projects for yourself, the tools behind them, where I have been, and what I am tinkering with right now.',
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

export const destinations: Destination[] = [
  { code: 'ER 01', label: 'PROJECTS', href: '/projects', note: 'Current & past work' },
  { code: 'ER 02', label: 'SKILLS', href: '/skills', note: 'Tools & technologies' },
  { code: 'ER 03', label: 'EXPERIENCE', href: '/experience', note: 'Career & work history' },
  { code: 'ER 04', label: 'ENTRIES', href: '/entries', note: 'Writing & notes' },
  { code: 'ER 05', label: 'PLAYGROUND', href: '/playground', note: 'Experiments & demos' },
];

// A few recent/current things surfaced on the homepage.
export const recent = [
  {
    title: 'Secure AI for firms',
    note: "A private, confidential AI tool I'm building for a client's team.",
    href: '/projects/secure-ai-for-firms',
    status: 'In progress',
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
