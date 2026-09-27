import { expect, test } from "@playwright/test";

// Playwright already gives each test a fresh, isolated browser context (and
// therefore fresh localStorage), so this is a belt-and-suspenders reset
// rather than a fix for cross-test bleed. It clears once, after the first
// navigation, since an addInitScript would keep re-running (and re-clearing)
// on every later goto/reload within the same test.
async function resetCart(page: import("@playwright/test").Page) {
  await page.evaluate(() => localStorage.removeItem("thial-cart"));
}

test("adding candles updates the header badge and persists across reloads", async ({
  page,
}) => {
  await page.goto("/collections/lugares/");
  await resetCart(page);
  const addButtons = page.locator("[data-add-to-cart]");

  await addButtons.nth(0).click();
  await addButtons.nth(0).click();
  await addButtons.nth(1).click();

  const badge = page.locator("[data-cart-count]");
  await expect(badge).toHaveText("3");

  await page.reload();
  await expect(page.locator("[data-cart-count]")).toHaveText("3");
});

test("the add button briefly announces success", async ({ page }) => {
  await page.goto("/collections/lugares/");
  await resetCart(page);
  const button = page.locator("[data-add-to-cart]").first();
  await button.click();
  await expect(button).toHaveText("¡Añadida!");
  await expect(button).toHaveText("Añadir al carrito", { timeout: 3000 });
});

test("cart page: quantity controls, remove, and live badge", async ({
  page,
}) => {
  await page.goto("/collections/lugares/");
  await resetCart(page);
  const addButtons = page.locator("[data-add-to-cart]");
  await addButtons.nth(0).click();
  await addButtons.nth(0).click();
  await addButtons.nth(1).click();

  await page.goto("/cart/");
  await expect(page.locator("[data-cart-line]")).toHaveCount(2);

  const firstLine = page.locator("[data-cart-line]").first();
  await firstLine.locator("[data-increase]").click();
  await expect(firstLine.locator("output")).toHaveText("3");
  await expect(page.locator("[data-cart-count]")).toHaveText("4");

  await firstLine.locator("[data-decrease]").click();
  await expect(firstLine.locator("output")).toHaveText("2");

  await firstLine.locator("[data-remove]").click();
  await expect(page.locator("[data-cart-line]")).toHaveCount(1);
  await expect(page.locator("[data-cart-count]")).toHaveText("1");
});

test("checkout link is a correctly encoded wa.me click-to-chat URL", async ({
  page,
}) => {
  await page.goto("/collections/lugares/");
  await resetCart(page);
  const addButtons = page.locator("[data-add-to-cart]");
  await addButtons.nth(0).click();
  await addButtons.nth(0).click();

  await page.goto("/cart/");
  const checkout = page.locator("[data-checkout]");
  const href = await checkout.getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\/573133846317\?text=/);

  const encoded = href!.split("?text=")[1];
  const decoded = decodeURIComponent(encoded);
  expect(decoded).toContain("¡Hola! Quiero hacer un pedido:");
  expect(decoded).toMatch(/- 2x .+/);
});

test("checkout message is localized on /en/cart/", async ({ page }) => {
  await page.goto("/en/collections/lugares/");
  await resetCart(page);
  await page.locator("[data-add-to-cart]").first().click();

  await page.goto("/en/cart/");
  const href = await page.locator("[data-checkout]").getAttribute("href");
  const decoded = decodeURIComponent(href!.split("?text=")[1]);
  expect(decoded).toContain("Hi! I'd like to place an order:");
});

test("empty cart shows the empty state and disables checkout", async ({
  page,
}) => {
  await page.goto("/cart/");
  await resetCart(page);
  await page.reload();
  await expect(page.locator("[data-cart-empty]")).toBeVisible();
  await expect(page.locator("[data-cart-summary]")).toBeHidden();
  const checkout = page.locator("[data-checkout]");
  await expect(checkout).toHaveAttribute("aria-disabled", "true");
  await expect(checkout).not.toHaveAttribute("href", /.+/);
});

test("the sent prompt can clear the cart", async ({ page }) => {
  await page.goto("/collections/lugares/");
  await resetCart(page);
  await page.locator("[data-add-to-cart]").first().click();

  await page.goto("/cart/");
  // Prevent the click from actually navigating away to WhatsApp.
  await page.locator("[data-checkout]").evaluate((el) => {
    el.addEventListener("click", (e) => e.preventDefault());
  });
  await page.locator("[data-checkout]").click();
  await expect(page.locator("[data-sent-prompt]")).toBeVisible();

  await page.locator("[data-sent-clear]").click();
  await expect(page.locator("[data-cart-empty]")).toBeVisible();
  await expect(page.locator("[data-cart-count]")).toBeHidden();
});
