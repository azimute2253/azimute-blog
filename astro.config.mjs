// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://azimute.cc',
  base: '/',
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
