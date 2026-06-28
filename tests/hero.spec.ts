import { test, expect } from "@playwright/test";

test.describe("Hero — first view", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Campus Crush/);
  });

  test("hero heading 'meet your' is visible", async ({ page }) => {
    const h1 = page.locator("h1#hero-heading");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("meet your");
  });

  test("wiggle-text wrapper is present", async ({ page }) => {
    // The wiggle-text class is on the div wrapping h1 + rotating phrase
    const wiggleEl = page.locator(".wiggle-text");
    await expect(wiggleEl).toBeVisible();
  });

  test("'meet your' label is visible", async ({ page }) => {
    // h1 lives inside the aria-live wiggle wrapper
    const label = page.locator("h1#hero-heading");
    await expect(label).toBeVisible();
    await expect(label).toContainText("meet your");
  });

  test("rotating phrase is visible on load", async ({ page }) => {
    // The interchanging phrase is the <p> inside the .wiggle-text wrapper.
    const rotatingEl = page.locator(".wiggle-text p");
    await expect(rotatingEl).toBeVisible();
    const initialText = await rotatingEl.textContent();
    expect(initialText?.trim().length).toBeGreaterThan(0);
  });

  test("rotating phrase changes after a couple seconds", async ({ page }) => {
    const rotatingEl = page.locator(".wiggle-text p");
    const first = await rotatingEl.textContent();
    // Wait for at least one rotation (2s interval + buffer)
    await page.waitForTimeout(2600);
    const second = await rotatingEl.textContent();
    expect(second).not.toBe(first);
  });

  test("hero renders the bento grid with 7 photo tiles", async ({ page }) => {
    await expect(page.locator(".hero-panel")).toBeVisible();
    await expect(page.locator(".bento-tile")).toHaveCount(7);
  });

  test("Join the Waitlist button is visible", async ({ page }) => {
    const btn = page.locator("button", { hasText: "Join the Waitlist" }).first();
    await expect(btn).toBeVisible();
  });

  test("navbar is transparent at top (no background)", async ({ page }) => {
    const nav = page.locator("nav[aria-label='Site navigation']");
    const bg = await nav.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    // transparent = rgba(0, 0, 0, 0)
    expect(bg).toBe("rgba(0, 0, 0, 0)");
  });

  test("navbar blurs on scroll", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(400);
    const nav = page.locator("nav[aria-label='Site navigation']");
    const bg = await nav.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    // Should no longer be fully transparent after scrolling
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("page has skip-nav link", async ({ page }) => {
    const skip = page.locator("a.skip-nav");
    await expect(skip).toHaveAttribute("href", "#main-content");
  });

  test("hero photo background image is loaded", async ({ page }) => {
    const img = page.locator("section img[src*='blurry-iceskating']").first();
    await expect(img).toBeAttached();
  });

  test("AppMockup section is not present", async ({ page }) => {
    // The AppMockup was removed — there should be no section with this id
    const mockup = page.locator("#app-mockup");
    await expect(mockup).toHaveCount(0);
  });
});
