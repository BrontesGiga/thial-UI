import { expect, test } from "@playwright/test";

// Hardcoded from src/content/candles/*.json's "collection" field, since this
// suite runs through Playwright's own TypeScript config (no Node types).
const candleCounts: Record<string, number> = {
  personas: 2,
  lugares: 2,
  momentos: 2,
  experiencias: 2,
};

function candleCountFor(collectionId: string): number {
  return candleCounts[collectionId];
}

const cases = [
  {
    locale: "es" as const,
    prefix: "",
    id: "lugares",
    name: "Lugares",
    lang: "es",
  },
  {
    locale: "en" as const,
    prefix: "/en",
    id: "lugares",
    name: "Places",
    lang: "en",
  },
];

for (const { prefix, id, name, lang } of cases) {
  test.describe(`${lang} collection page`, () => {
    test(`clicking the ${id} card navigates to the detail page`, async ({
      page,
    }) => {
      await page.goto(`${prefix}/`);
      await page
        .locator("#collections li")
        .filter({ hasText: name })
        .getByRole("link")
        .click();
      await expect(page).toHaveURL(new RegExp(`${prefix}/collections/${id}/$`));
      await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
      await expect(page).toHaveTitle(new RegExp(name));
    });

    test(`lists only candles from ${id}`, async ({ page }) => {
      await page.goto(`${prefix}/collections/${id}/`);
      const expected = candleCountFor(id);
      await expect(page.locator("article")).toHaveCount(expected);
    });

    test("has canonical and hreflang links", async ({ page }) => {
      await page.goto(`${prefix}/collections/${id}/`);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`${prefix}/collections/${id}/$`),
      );
      await expect(
        page.locator('link[rel="alternate"][hreflang="es"]'),
      ).toHaveCount(1);
      await expect(
        page.locator('link[rel="alternate"][hreflang="en"]'),
      ).toHaveCount(1);
      await expect(
        page.locator('link[rel="alternate"][hreflang="x-default"]'),
      ).toHaveCount(1);
    });

    test("the language switch keeps the same collection", async ({ page }) => {
      await page.goto(`${prefix}/collections/${id}/`);
      const otherPrefix = prefix === "" ? "/en" : "";
      await page.locator("[data-lang-switch]").click();
      await expect(page).toHaveURL(
        new RegExp(`${otherPrefix}/collections/${id}/$`),
      );
    });

    test("has no console errors", async ({ page }) => {
      const errors: string[] = [];
      page.on(
        "console",
        (msg) => msg.type() === "error" && errors.push(msg.text()),
      );
      page.on("pageerror", (err) => errors.push(err.message));
      await page.goto(`${prefix}/collections/${id}/`);
      expect(errors).toEqual([]);
    });
  });
}

test("an unknown collection id returns 404", async ({ page }) => {
  const response = await page.goto("/collections/nope/");
  expect(response?.status()).toBe(404);
});

test("an unknown collection id returns 404 (en)", async ({ page }) => {
  const response = await page.goto("/en/collections/nope/");
  expect(response?.status()).toBe(404);
});
