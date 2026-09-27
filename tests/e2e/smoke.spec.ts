import { expect, test } from "@playwright/test";

const sectionIds = [
  "essence",
  "values",
  "collections",
  "candles",
  "faq",
  "buy",
];

for (const { path, lang, heading } of [
  { path: "/", lang: "es", heading: "Esencia de Thial" },
  { path: "/en/", lang: "en", heading: "The essence of Thial" },
]) {
  test.describe(`${lang} page`, () => {
    test("loads without console errors", async ({ page }) => {
      const errors: string[] = [];
      page.on(
        "console",
        (msg) => msg.type() === "error" && errors.push(msg.text()),
      );
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(
        page.getByRole("heading", { level: 2, name: heading }),
      ).toBeVisible();
      expect(errors).toEqual([]);
    });

    test("renders all sections in order", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("header.header")).toBeVisible();
      await expect(page.locator("section.hero")).toBeVisible();
      await expect(page.locator("footer.footer")).toBeVisible();

      const ids = await page
        .locator("main > section[id]")
        .evaluateAll((els) => els.map((el) => el.id));
      expect(ids).toEqual(sectionIds);
    });

    test("shows 4 collections and 8 candles", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("#collections li")).toHaveCount(4);
      await expect(page.locator("#candles article")).toHaveCount(8);
    });

    test("has no horizontal scroll on a phone", async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}

test("language switch keeps the current section", async ({ page }) => {
  await page.goto("/#values");
  await page.getByRole("link", { name: "Ver esta página en inglés" }).click();
  await expect(page).toHaveURL(/\/en\/#values$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.getByRole("link", { name: "View this page in Spanish" }).click();
  await expect(page).toHaveURL(/\/#values$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test("opens, reaches every section and closes", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Menú" });
    const nav = page.getByRole("navigation", { name: "Navegación principal" });

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(nav).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    for (const id of sectionIds) {
      await expect(nav.locator(`a[href="#${id}"]`)).toBeVisible();
    }

    await nav.getByRole("link", { name: "Velas" }).click();
    await expect(page).toHaveURL(/#candles$/);
    await expect(nav).toBeHidden();

    await toggle.click();
    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test("header is opaque", async ({ page }) => {
    await page.goto("/");
    const styles = await page.locator("header.header").evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, blur: s.backdropFilter };
    });
    expect(styles.bg).toBe("rgb(255, 249, 244)");
    expect(styles.blur).toBe("none");
  });
});
