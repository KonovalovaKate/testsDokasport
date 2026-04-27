import type { Locator, Page } from "@playwright/test";

const selectors = {
  topMenuNav: "nav#menu, #menu, .menu.menu2, .main-menu",
  categoryMenuButton:
    "#menu .fa-bars, #menu [class*='bars'], #menu .icon-bar, #menu .menu-icon, #menu .pull-right, nav.menu .pull-right",
  searchInput:
    "#search2 input[type='text'], #search input[type='text'], .header-search input[type='text'], input[name='search']",
  heroBanner:
    ".swiper, .swiper-container, .common-home .slideshow, #slideshow, .banner, .carousel",
  productCards:
    ".product-layout, .product-grid .product-item, .product-thumb, .products .product-item",
  resultTitleLinks:
    "#content a[href*='product_id='], .product-layout a[href*='product_id='], .product-thumb a[href*='product_id='], .product-list a[href*='product_id=']"
} as const;

export class MainPage {
  constructor(private readonly page: Page) {}

  async visitHome(): Promise<void> {
    await this.page.goto("/");
  }

  topMenuNav(): Locator {
    return this.page.locator(selectors.topMenuNav).first();
  }

  categoryMenuButton(): Locator {
    return this.page.locator(selectors.categoryMenuButton).first();
  }

  searchInput(): Locator {
    return this.page.locator(selectors.searchInput).first();
  }

  async searchFor(query: string): Promise<void> {
    const input = this.searchInput();
    await input.clear({ force: true });
    await input.fill(query);
    await input.press("Enter");
  }

  heroBanner(): Locator {
    return this.page.locator(selectors.heroBanner).first();
  }

  recommendedHeading(): Locator {
    return this.page.getByText(/Рекомендовані|Рекомендуем|Recommended/i).first();
  }

  productCards(): Locator {
    return this.page.locator(selectors.productCards);
  }

  /** Title links on search results with non-empty visible text. */
  async resultTitleLinks(): Promise<Locator[]> {
    const all = this.page.locator(selectors.resultTitleLinks).filter({ visible: true });
    const n = await all.count();
    const out: Locator[] = [];
    for (let i = 0; i < n; i++) {
      const link = all.nth(i);
      const text = ((await link.innerText()) || "").trim();
      if (text.length > 0) {
        out.push(link);
      }
    }
    return out;
  }
}
