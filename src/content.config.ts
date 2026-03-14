import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const wanderSchema = z.object({
  title: z.string(),
  theme: z.string(),
  date: z.string(),
  excerpt: z.string(),
  readingTime: z.string().default("3 min"),
  layers: z.array(z.string()).default([]),
});

const wanders = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/wanders" }),
  schema: wanderSchema,
});

const wandersPt = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/wanders-pt" }),
  schema: wanderSchema,
});

export const collections = { wanders, 'wanders-pt': wandersPt };
