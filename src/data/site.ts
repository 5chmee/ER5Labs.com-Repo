// ---------------------------------------------------------------------------
// SITE CONTENT — edit this file to change the homepage copy, the board's
// destinations, recent work, and contact links. No other files need touching.
// ---------------------------------------------------------------------------

export const profile = {
  name: 'Emad Rafiq',
  brand: 'ER5Labs',
  // One human sentence — keep it in your own voice.
  intro:
    "I'm Emad Rafiq. I build and run digital projects under ER5Labs — a home base for everything I create, control, and collaborate on.",
  // Short About shown on the homepage (each string is a paragraph).
  about: [
    'ER5Labs is my personal brand for the work I do online — a hub that ties together the sites, tools, and experiments I build.',
    'This board is the front door. Pick a destination to see the work itself, the tools behind it, where I have been, and what I am tinkering with right now.',
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
    title: 'ER5Labs.com',
    note: 'This hub — the central link for all my work.',
    href: '/projects',
    status: 'Live',
  },
];

export const interests = ['Web & digital craft', 'Minimal, human design', 'Building in the open'];

// NOTE: placeholders — replace with your real links when you decide the
// contact treatment. Your personal email is intentionally not hard-coded here.
export const contact = {
  email: 'hello@er5labs.com',
  linkedin: 'https://www.linkedin.com/in/your-handle',
};
