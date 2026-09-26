import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/en/"]) {
  test(`no serious or critical axe violations with the mobile menu open on ${path}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(path);
    await page.locator("[data-menu-toggle]").click();
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => v.id);
    expect(blocking).toEqual([]);
  });

  test(`no serious or critical axe violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      );
    expect(blocking).toEqual([]);
  });
}
