import { describe, expect, it } from "vitest";
import es from "../../src/i18n/es.json";
import en from "../../src/i18n/en.json";
import {
  collectKeys,
  getDictionary,
  getLocaleFromUrl,
  localizedPath,
  otherLocale,
  useTranslations,
} from "../../src/i18n/utils";

describe("getLocaleFromUrl", () => {
  it("returns es for the root path", () => {
    expect(getLocaleFromUrl(new URL("http://localhost/"))).toBe("es");
  });

  it("returns en for /en/ paths", () => {
    expect(getLocaleFromUrl(new URL("http://localhost/en/"))).toBe("en");
    expect(getLocaleFromUrl(new URL("http://localhost/en"))).toBe("en");
  });

  it("falls back to es for unknown prefixes", () => {
    expect(getLocaleFromUrl(new URL("http://localhost/fr/"))).toBe("es");
    expect(getLocaleFromUrl(new URL("http://localhost/english/"))).toBe("es");
  });
});

describe("localizedPath", () => {
  it("keeps the default locale unprefixed", () => {
    expect(localizedPath("es")).toBe("/");
    expect(localizedPath("es", "/#valores")).toBe("/#valores");
  });

  it("prefixes the English locale", () => {
    expect(localizedPath("en")).toBe("/en/");
    expect(localizedPath("en", "/#valores")).toBe("/en/#valores");
  });
});

describe("otherLocale", () => {
  it("swaps between es and en", () => {
    expect(otherLocale("es")).toBe("en");
    expect(otherLocale("en")).toBe("es");
  });
});

describe("useTranslations", () => {
  it("resolves dot-separated keys", () => {
    expect(useTranslations("es")("hero.tagline")).toBe(es.hero.tagline);
    expect(useTranslations("en")("hero.tagline")).toBe(en.hero.tagline);
  });

  it("throws on a missing key so gaps fail the build", () => {
    expect(() => useTranslations("es")("hero.missing")).toThrow(/hero\.missing/);
  });
});

describe("dictionaries", () => {
  it("getDictionary returns the locale file", () => {
    expect(getDictionary("es")).toBe(es);
    expect(getDictionary("en")).toBe(en);
  });

  it("es and en have the same keys", () => {
    expect(collectKeys(en)).toEqual(collectKeys(es));
  });

  it("has no empty strings", () => {
    for (const dict of [es, en]) {
      const empty = collectKeys(dict).filter((key) => {
        const value = key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], dict);
        return typeof value === "string" && value.trim() === "";
      });
      expect(empty).toEqual([]);
    }
  });
});
