// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://azimute.ai',
  build: { format: 'directory' },
  markdown: {
    shikiConfig: { theme: 'github-dark' }
  }
});
