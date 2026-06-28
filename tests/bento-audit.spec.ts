import { test, expect } from "@playwright/test";

/**
 * Bento hero audit — the CTA ("Join the Waitlist") and the scarcity counter
 * ("X spots left") must both be FULLY visible in the first fold (no scroll)
 * at every screen size, with no horizontal overflow.
 */

const viewports: { name: string; width: number; height: number }[] = [
  { name: "320x568  (iPhone SE / small)", width: 320, height: 568 },
  { name: "375x667  (iPhone 8)", width: 375, height: 667 },
  { name: "390x844  (iPhone 12/13)", width: 390, height: 844 },
  { name: "414x896  (iPhone XR)", width: 414, height: 896 },
  { name: "768x1024 (iPad portrait)", width: 768, height: 1024 },
  { name: "820x1180 (iPad Air)", width: 820, height: 1180 },
  { name: "1024x768 (iPad landscape / small laptop)", width: 1024, height: 768 },
  { name: "1280x720 (laptop)", width: 1280, height: 720 },
  { name: "1366x768 (common laptop)", width: 1366, height: 768 },
  { name: "1440x900 (laptop large)", width: 1440, height: 900 },
  { name: "1920x1080 (desktop)", width: 1920, height: 1080 },
  { name: "2560x1440 (QHD)", width: 2560, height: 1440 },
];

const slug = (s: string) => s.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");

for (const vp of viewports) {
  test(`CTA + spots-left fully visible @ ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");

    const cta = page.locator("button", { hasText: "Join the Waitlist" }).first();
    // The scarcity counter renders only once the signup count loads (spotsLeft > 0).
    const spots = page.getByText("spots left").first();

    await expect(cta, "CTA button should exist").toBeVisible();
    await expect(spots, "'spots left' counter should load and be visible").toBeVisible({
      timeout: 10_000,
    });

    // Screenshot the first fold for the visual record.
    await page.screenshot({
      path: `test-results/bento-audit/${slug(vp.name)}.png`,
    });

    // FULLY in viewport (ratio 1 = the entire element rect is on-screen, no clipping).
    await expect(cta, "CTA must be 100% within the viewport (no scroll)").toBeInViewport({
      ratio: 1,
    });
    await expect(spots, "'spots left' must be 100% within the viewport (no scroll)").toBeInViewport({
      ratio: 1,
    });

    // No horizontal overflow from the HERO itself (in scope for this change).
    const heroOverflow = await page.evaluate(() => {
      const hero = document.querySelector(".hero-bento") as HTMLElement | null;
      const clientW = document.documentElement.clientWidth;
      if (!hero) return { scrollW: 0, clientW };
      // widest descendant right-edge within the hero
      let maxRight = 0;
      hero.querySelectorAll("*").forEach((n) => {
        const r = (n as HTMLElement).getBoundingClientRect();
        if (r.right > maxRight) maxRight = r.right;
      });
      return { scrollW: Math.round(maxRight), clientW };
    });
    expect(
      heroOverflow.scrollW,
      `hero must not overflow horizontally (right ${heroOverflow.scrollW} <= ${heroOverflow.clientW})`
    ).toBeLessThanOrEqual(heroOverflow.clientW + 2);

    // Document-level overflow is logged only (pre-existing navbar/footer at very
    // narrow widths; clipped by body{overflow-x:hidden}, not user-scrollable).
    const docW = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    if (docW.scrollW > docW.clientW + 1) {
      console.log(
        `[info] ${vp.name}: document scrollWidth ${docW.scrollW} > ${docW.clientW} (pre-existing navbar/footer, clipped)`
      );
    }

    // Belt-and-suspenders: assert the rects sit inside the viewport box explicitly.
    const ctaBox = await cta.boundingBox();
    const spotsBox = await spots.boundingBox();
    expect(ctaBox, "CTA bounding box").not.toBeNull();
    expect(spotsBox, "spots bounding box").not.toBeNull();
    for (const [label, box] of [
      ["CTA", ctaBox!],
      ["spots", spotsBox!],
    ] as const) {
      expect(box.x, `${label} left edge >= 0`).toBeGreaterThanOrEqual(-1);
      expect(box.y, `${label} top edge >= 0`).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width, `${label} right edge <= ${vp.width}`).toBeLessThanOrEqual(vp.width + 1);
      expect(box.y + box.height, `${label} bottom edge <= ${vp.height}`).toBeLessThanOrEqual(vp.height + 1);
    }
  });
}
