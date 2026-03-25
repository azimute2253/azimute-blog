/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './node_modules/nexus-data/src/**/*.{js,jsx,ts,tsx}',
    './node_modules/nexus-data/dist/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
