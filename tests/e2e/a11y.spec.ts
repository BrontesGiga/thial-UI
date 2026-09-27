import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The homepage reveals sections with a CSS opacity transition on scroll.
// Scanning mid-transition can catch a partially-blended (and therefore
// briefly low-contrast) color, so a11y checks run with reduced motion,
// which the app already treats as a first-class no-animation mode.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

function assertNoBlockingViolations(
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
) {
  const blocking = violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map(
      (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
    );
  expect(blocking).toEqual([]);
}

for (const path of ["/", "/en/"]) {
  test(`no serious or critical axe violations with the mobile menu open on ${path}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(path);
    await page.locator("[data-menu-toggle]").click();
    const results = await new AxeBuilder({ page }).analyze();
    assertNoBlockingViolations(results.violations);
  });

  test(`no serious or critical axe violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    assertNoBlockingViolations(results.violations);
  });
}

for (const path of ["/collections/lugares/", "/en/collections/lugares/"]) {
  test(`no serious or critical axe violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    assertNoBlockingViolations(results.violations);
  });
}

test("no serious or critical axe violations on /cart/ with an empty cart", async ({
  page,
}) => {
  await page.goto("/cart/");
  await page.evaluate(() => localStorage.removeItem("thial-cart"));
  await page.reload();
  const results = await new AxeBuilder({ page }).analyze();
  assertNoBlockingViolations(results.violations);
});

test("no serious or critical axe violations on /cart/ with one item", async ({
  page,
}) => {
  await page.goto("/collections/lugares/");
  await page.evaluate(() => localStorage.removeItem("thial-cart"));
  await page.locator("[data-add-to-cart]").first().click();
  await page.goto("/cart/");
  const results = await new AxeBuilder({ page }).analyze();
  assertNoBlockingViolations(results.violations);
});
