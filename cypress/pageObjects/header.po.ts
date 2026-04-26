export class HeaderPage {
  private readonly selectors = {
    header: "header",
    headerContainer: "header .container, .header-block, #top .container",
    logoLink: 'a[href="/"], a[href="https://dokasport.com.ua/"], #logo a',
    cartArea: "#cart, .cart, .fa-shopping-cart, .icon-bag, [class*='cart']",
    burgerButton:
      ".navbar-toggle, .menu-btn, #menu .btn, .fa-bars, .fa-navicon, button[aria-label*='menu'], button[aria-label*='Menu']",
    mobileNav: "#main-menu, .navbar-collapse, .collapse.in, .mobile-menu, .menu-open, nav",
    topUtilityBar: "#top, .top-menu, .topbar"
  };

  visitHome(): void {
    cy.visit("/");
  }

  getHeader(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.header);
  }

  getHeaderContainer(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.headerContainer).first();
  }

  getLogoLink(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.getHeader().find(this.selectors.logoLink).first();
  }

  getHeaderText(): Cypress.Chainable<string> {
    return this.getHeader().invoke("text");
  }

  getCartArea(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.getHeader().find(this.selectors.cartArea).first();
  }

  clickBurgerButton(): void {
    this.getHeader().find(this.selectors.burgerButton).first().click({ force: true });
  }

  getVisibleMobileNav(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.mobileNav).filter(":visible");
  }

  getTopUtilityBar(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.topUtilityBar).first();
  }
}
