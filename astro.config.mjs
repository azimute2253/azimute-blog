// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://azimute.cc',
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap(), tailwind(), react()],
  build: { format: 'directory' },
  vite: {
    // nexus-data ships raw .ts — Vite must transpile it for SSR
    ssr: { noExternal: ['nexus-data'] },
  },
  markdown: {
    shikiConfig: { theme: 'github-dark' }
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});
