import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
// Every page is still prerendered to static HTML. The only on-demand route is
// /api/markets.json (see src/pages/api/), which proxies live market data — the
// adapter is what lets that one endpoint run as a serverless function.
export default defineConfig({
  site: 'https://er5labs.com',
  integrations: [sitemap()],
  adapter: vercel(),
});
