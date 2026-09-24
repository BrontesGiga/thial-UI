import es from "./es.json";
import en from "./en.json";

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export type Dictionary = typeof es;

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, first] = url.pathname.split("/");
  return isLocale(first) ? first : defaultLocale;
}

/** Path for a locale. `path` starts with "/" and may carry a #hash. */
export function localizedPath(locale: Locale, path = "/"): string {
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "es" ? "en" : "es";
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Returns t(key) for dot-separated keys. Throws on a missing key. */
export function useTranslations(locale: Locale) {
  const dict = getDictionary(locale);
  return (key: string): string => {
    const value = key
      .split(".")
      .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], dict);
    if (typeof value !== "string") {
      throw new Error(`Missing translation "${key}" for locale "${locale}"`);
    }
    return value;
  };
}

/** Sorted list of every leaf key path, array items included by index. */
export function collectKeys(node: unknown, prefix = ""): string[] {
  if (node === null || typeof node !== "object") return [prefix];
  return Object.entries(node as Record<string, unknown>)
    .flatMap(([key, child]) => collectKeys(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}
