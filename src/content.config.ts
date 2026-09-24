import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const localized = z.object({
  es: z.string().min(1),
  en: z.string().min(1),
});

/** Story collections, grouped by where the story comes from (manual: Arquitectura de colecciones). */
const storyCollections = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/collections" }),
  schema: ({ image }) =>
    z.object({
      order: z.number().int(),
      name: localized,
      description: localized,
      image: image(),
      imageAlt: localized,
    }),
});

/** Candles (manual: Estructura de cada vela). */
const candles = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/candles" }),
  schema: ({ image }) =>
    z.object({
      order: z.number().int(),
      collection: reference("collections"),
      name: localized,
      aroma: localized,
      phrase: localized,
      image: image(),
      imageAlt: localized,
      /** true while the candle is sample content, not a real product. */
      placeholder: z.boolean().default(false),
    }),
});

export const collections = { collections: storyCollections, candles };
