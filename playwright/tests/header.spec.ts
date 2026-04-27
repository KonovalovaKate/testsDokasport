import { test, expect } from "../fixtures/test-base";
import { checkPageReady } from "../helpers/page-ready";
import { HeaderPage } from "../pages/header.page";

test.describe("DokaSport header", () => {
  test.beforeEach(async ({ page }) => {
    const headerPage = new HeaderPage(page);
    await headerPage.visitHome();
    await checkPageReady(page);
  });

  test("shows core header structure on desktop", async ({ page }) => {
    const headerPage = new HeaderPage(page);
    await page.setViewportSize({ width: 1366, height: 768 });

    await expect(headerPage.header()).toBeVisible();
    await expect(headerPage.headerContainer()).toBeVisible();

    const logo = headerPage.logoLink();
    await expect(logo).toBeVisible();
    const href = (await logo.getAttribute("href")) || "";
    expect(href).toMatch(/\/$/);

    const text = (await headerPage.headerText()).replace(/\s+/g, " ").trim();
    expect(text).toMatch(/\+?\d[\d\-() ]{6,}/);

    await expect(headerPage.cartArea()).toBeAttached();
  });

  test("opens mobile navigation from burger button", async ({ page }) => {
    const headerPage = new HeaderPage(page);
    await page.setViewportSize({ width: 375, height: 812 });

    await expect(headerPage.header()).toBeVisible();
    await headerPage.clickBurgerButton();
    expect(await headerPage.visibleMobileNav().count()).toBeGreaterThan(0);
  });

  test("keeps top utility bar visible", async ({ page }) => {
    const headerPage = new HeaderPage(page);
    await expect(headerPage.topUtilityBar()).toBeVisible();
  });
});
