import searchFixtures from "../../cypress/fixtures/search-fixtures.json";
import { test, expect } from "../fixtures/test-base";
import { checkPageReady } from "../helpers/page-ready";
import { MainPage } from "../pages/main.page";

type SearchFixture = { query: string; expectedInTitle: string };

const searchCases = searchFixtures as SearchFixture[];

test.describe("DokaSport main page", () => {
  test.beforeEach(async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.visitHome();
    await checkPageReady(page);
  });

  test("shows main navigation and hero content", async ({ page }) => {
    const mainPage = new MainPage(page);
    await page.setViewportSize({ width: 1366, height: 768 });

    await expect(mainPage.topMenuNav()).toBeVisible();
    await expect(mainPage.heroBanner()).toBeVisible();
    await expect(mainPage.recommendedHeading()).toBeVisible();
    await expect(mainPage.productCards().first()).toBeVisible({ timeout: 15_000 });
  });

  test("searches from header search input", async ({ page }) => {
    const mainPage = new MainPage(page);
    const query = "корсет";

    await expect(mainPage.searchInput()).toBeVisible();
    await mainPage.searchFor(query);

    const url = page.url();
    expect(url).toContain("search=");
    expect(url).toContain(encodeURIComponent(query));
  });

  test("shows category menu trigger on mobile", async ({ page }) => {
    const mainPage = new MainPage(page);
    await page.setViewportSize({ width: 375, height: 812 });

    await expect(mainPage.topMenuNav()).toBeVisible();
    await expect(mainPage.categoryMenuButton()).toBeVisible();
  });

  for (const { query, expectedInTitle } of searchCases) {
    test(`shows filtered items for "${query}" and titles contain expected word`, async ({ page }) => {
      const mainPage = new MainPage(page);
      await expect(mainPage.searchInput()).toBeVisible();
      await mainPage.searchFor(query);

      const url = page.url();
      expect(url).toContain("search=");
      expect(url).toContain(encodeURIComponent(query));

      const links = await mainPage.resultTitleLinks();
      expect(links.length).toBeGreaterThan(0);

      for (const link of links) {
        const title = ((await link.innerText()) || "").toLowerCase().trim();
        expect(title).toContain(expectedInTitle.toLowerCase());
      }
    });
  }
});
