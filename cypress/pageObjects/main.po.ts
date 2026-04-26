export class MainPage {
  private readonly selectors = {
    topMenuNav: "nav#menu, #menu, .menu.menu2, .main-menu",
    categoryMenuButton:
      "#menu .fa-bars, #menu [class*='bars'], #menu .icon-bar, #menu .menu-icon, #menu .pull-right, nav.menu .pull-right",
    searchInput:
      "#search2 input[type='text'], #search input[type='text'], .header-search input[type='text'], input[name='search']",
    searchButton: "#search2 button, #search button, .header-search button",
    heroBanner:
      ".swiper, .swiper-container, .common-home .slideshow, #slideshow, .banner, .carousel",
    recommendedSection: "body",
    productCards:
      ".product-layout, .product-grid .product-item, .product-thumb, .products .product-item",
    resultTitleLinks:
      "#content a[href*='product_id='], .product-layout a[href*='product_id='], .product-thumb a[href*='product_id='], .product-list a[href*='product_id=']"
  };

  visitHome(): void {
    cy.visit("/");
  }

  getTopMenuNav(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.topMenuNav).first();
  }

  getCategoryMenuButton(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.categoryMenuButton).first();
  }

  getSearchInput(): Cypress.Chainable<JQuery<HTMLInputElement>> {
    return cy.get(this.selectors.searchInput).first() as Cypress.Chainable<JQuery<HTMLInputElement>>;
  }

  clickSearchButton(): void {
    cy.get(this.selectors.searchButton).first().click({ force: true });
  }

  searchFor(query: string): void {
    this.getSearchInput().clear({ force: true }).type(`${query}{enter}`, { force: true });
  }

  getHeroBanner(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.heroBanner).first();
  }

  getRecommendedHeading(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy
      .contains(this.selectors.recommendedSection, /Рекомендовані|Рекомендуем|Recommended/i)
      .first();
  }

  getProductCards(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.productCards);
  }

  getResultTitleLinks(): Cypress.Chainable<JQuery<HTMLAnchorElement>> {
    return cy
      .get(this.selectors.resultTitleLinks)
      .filter(":visible")
      .then(($links) => {
        const uniqueText = Array.from($links).filter((el) => (el.textContent || "").trim().length > 0);
        return cy.wrap(Cypress.$(uniqueText) as JQuery<HTMLAnchorElement>);
      });
  }
}
