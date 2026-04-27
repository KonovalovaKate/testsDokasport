import type { Locator, Page } from "@playwright/test";

const selectors = {
  header: "header",
  headerContainer: "header .container, .header-block, #top .container",
  logoLink: 'a[href="/"], a[href="https://dokasport.com.ua/"], #logo a',
  cartArea: "#cart, .cart, .fa-shopping-cart, .icon-bag, [class*='cart']",
  burgerButton:
    ".navbar-toggle, .menu-btn, #menu .btn, .fa-bars, .fa-navicon, button[aria-label*='menu'], button[aria-label*='Menu']",
  mobileNav: "#main-menu, .navbar-collapse, .collapse.in, .mobile-menu, .menu-open, nav",
  topUtilityBar: "#top, .top-menu, .topbar"
} as const;

export class HeaderPage {
  constructor(private readonly page: Page) {}

  async visitHome(): Promise<void> {
    await this.page.goto("/");
  }

  header(): Locator {
    return this.page.locator(selectors.header).first();
  }

  headerContainer(): Locator {
    return this.page.locator(selectors.headerContainer).first();
  }

  logoLink(): Locator {
    return this.header().locator(selectors.logoLink).first();
  }

  async headerText(): Promise<string> {
    return (await this.header().innerText()) || "";
  }

  cartArea(): Locator {
    return this.header().locator(selectors.cartArea).first();
  }

  async clickBurgerButton(): Promise<void> {
    await this.header().locator(selectors.burgerButton).first().click({ force: true });
  }

  visibleMobileNav(): Locator {
    return this.page.locator(selectors.mobileNav).filter({ visible: true });
  }

  topUtilityBar(): Locator {
    return this.page.locator(selectors.topUtilityBar).first();
  }
}
