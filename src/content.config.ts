import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// "Entries" — writing & notes. Add a Markdown file in src/content/entries/ with
// frontmatter (title, date, summary) and it appears automatically.
const entries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/entries' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { entries };
