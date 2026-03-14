import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const wanders = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/wanders" }),
  schema: z.object({
    title: z.string(),
    theme: z.string(),
    date: z.string(),
    excerpt: z.string(),
    readingTime: z.string().default("3 min"),
    layers: z.array(z.string()).default([]),
  }),
});

export const collections = { wanders };
