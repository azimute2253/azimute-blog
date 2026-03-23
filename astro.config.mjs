// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://azimute.cc',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap(), tailwind()],
  build: { format: 'directory' },
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
