// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://azimute2253.github.io',
  base: '/azimute-blog',
  build: { format: 'directory' },
  markdown: {
    shikiConfig: { theme: 'github-dark' }
  }
});
