import { getCollection, getEntry } from "astro:content";
import type { CollectionItem } from "../components/Collections.astro";
import type { CandleItem } from "../components/CandleCard.astro";
import { localizedPath, type Locale } from "../i18n/utils";

/** Sorted collection cards for `locale`, each linking to its detail page. */
export async function getCollectionItems(
  locale: Locale,
): Promise<CollectionItem[]> {
  const storyCollections = (await getCollection("collections")).sort(
    (a, b) => a.data.order - b.data.order,
  );
  return storyCollections.map(({ id, data }) => ({
    id,
    name: data.name[locale],
    description: data.description[locale],
    image: data.image,
    imageAlt: data.imageAlt[locale],
    href: localizedPath(locale, `/collections/${id}/`),
  }));
}

/** Sorted candles for `locale`, optionally filtered to one collection. */
export async function getCandleItems(
  locale: Locale,
  collectionId?: string,
): Promise<CandleItem[]> {
  const candles = (await getCollection("candles"))
    .filter(
      ({ data }) =>
        collectionId === undefined || data.collection.id === collectionId,
    )
    .sort((a, b) => a.data.order - b.data.order);

  return Promise.all(
    candles.map(async ({ id, data }) => {
      const collection = await getEntry(data.collection);
      return {
        id,
        name: data.name[locale],
        collectionName: collection?.data.name[locale] ?? "",
        aroma: data.aroma[locale],
        phrase: data.phrase[locale],
        image: data.image,
        imageAlt: data.imageAlt[locale],
      };
    }),
  );
}

/** Whether any candle (optionally within one collection) is still a placeholder. */
export async function hasPlaceholderCandles(
  collectionId?: string,
): Promise<boolean> {
  const candles = await getCollection("candles");
  return candles.some(
    ({ data }) =>
      data.placeholder &&
      (collectionId === undefined || data.collection.id === collectionId),
  );
}
