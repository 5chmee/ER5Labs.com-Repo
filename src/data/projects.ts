// ---------------------------------------------------------------------------
// PROJECTS — add a project by adding an object here. Each becomes a row on the
// Projects page and its own detail page at /projects/<slug>.
// ---------------------------------------------------------------------------

export type Media = { type: 'image' | 'video'; src: string; alt?: string };

export type Project = {
  slug: string;                 // URL-safe id, e.g. "er5labs"
  title: string;
  blurb: string;                // one line, shown in the list
  year: string;
  status: 'Live' | 'In progress' | 'Archived';
  url?: string;                 // link to the live project, if any
  tags: string[];               // short descriptors
  tools: string[];              // tech/tools used
  skills: string[];             // skills the project drew on
  summary: string[];            // paragraphs for the detail page
  media?: Media[];              // optional images/videos on the detail page
};

export const projects: Project[] = [
  {
    slug: 'er5labs',
    title: 'ER5Labs.com',
    blurb: 'This hub — the front door linking to everything I build.',
    year: '2026',
    status: 'Live',
    url: 'https://er5labs.com',
    tags: ['Hub', 'Portfolio'],
    tools: ['Astro', 'HTML', 'CSS', 'JavaScript', 'Git'],
    skills: ['Front-end', 'Design systems', 'Information architecture'],
    summary: [
      'ER5Labs.com is the central hub for my work — a light, minimal site whose homepage is a split-flap departure board that routes visitors to everything I make.',
      'It is built to grow: projects, skills, experience, writing and experiments each have their own space, and adding new work is a one-file edit away.',
    ],
  },

  // ---- EXAMPLE — replace with a real project, or delete this entry ----
  {
    slug: 'example-project',
    title: 'Example Project',
    blurb: 'One line on what this project is and why it matters.',
    year: '2026',
    status: 'In progress',
    tags: ['Web app'],
    tools: ['Tool A', 'Tool B'],
    skills: ['Skill A', 'Skill B'],
    summary: [
      'A short paragraph describing the project — the problem it solves and your role in it.',
      'A second paragraph on the approach, the interesting challenges, and how it turned out.',
    ],
  },
];
