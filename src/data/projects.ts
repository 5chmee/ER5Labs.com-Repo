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
    slug: 'confidential-ai-tool',
    title: 'Private and Confidential AI Processing Tool',
    blurb: 'A private, regulation-compliant AI tool that lets firms use AI without exposing client data.',
    year: '2026',
    status: 'Live',
    // No public link — this is confidential client work.
    tags: ['AI', 'Security', 'Client work'],
    // NOTE: tools/skills below are inferred — tell me the real stack to correct them.
    tools: ['AI / LLM', 'Database', 'Encryption', 'Authentication'],
    skills: ['AI output validation', 'Data privacy & compliance', 'Security & encryption', 'Backend & databases'],
    summary: [
      "A private, confidential AI tool that lets small firms and enterprises put AI to work without exposing their clients' data. It is built around confidentiality: requests stay private, and the AI's outputs are proof-checked for accuracy — whether that is summarising a balance sheet or categorising a bank statement.",
      "It is currently being rolled out to a client's team of 30, which has meant meeting strict regulatory, privacy and safety standards from the ground up. Active work includes a redaction feature, and an auditing and reuse layer so common requests do not have to be rewritten each time — saving time, tokens and cost.",
      'Still on the roadmap: secure account provisioning with encrypted credentials in the database, and a usage dashboard so an administrator can oversee what their team is using the tool for.',
    ],
  },
  {
    slug: 'er5labs',
    title: 'ER5Labs.com',
    blurb: 'This site — my personal hub, updated whenever I ship something new.',
    year: '2026',
    status: 'Live',
    url: 'https://er5labs.com',
    tags: ['Portfolio', 'Web'],
    tools: ['Astro', 'HTML', 'CSS', 'JavaScript', 'Git'],
    skills: ['Front-end', 'Design systems', 'Information architecture'],
    summary: [
      'ER5Labs.com is the central hub for my work — a light, minimal site whose homepage is a split-flap departure board that routes visitors to everything I make.',
      'It is built to grow: projects, skills, experience, writing and experiments each have their own space, and I update it whenever I build something new.',
    ],
  },
];
