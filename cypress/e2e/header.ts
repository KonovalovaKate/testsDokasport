describe("DokaSport header", () => {
  const headerSelector = "header .container, .header-block, #top .container";

  beforeEach(() => {
    cy.visit("/");
  });

  it("shows core header structure on desktop", () => {
    cy.viewport(1366, 768);

    cy.get("header").should("be.visible");
    cy.get(headerSelector).first().should("be.visible");

    // Logo block should exist and navigate home when clicked.
    cy.get("header")
      .find('a[href="/"], a[href="https://dokasport.com.ua/"], #logo a')
      .first()
      .should("be.visible")
      .and(($a: JQuery<HTMLElement>) => {
        const href = $a.attr("href") || "";
        expect(href).to.match(/\/$/);
      });

    // Phone/contact area should contain at least one visible number-like value.
    cy.get("header")
      .invoke("text")
      .then((text: string) => {
        const normalized = text.replace(/\s+/g, " ").trim();
        expect(normalized).to.match(/\+?\d[\d\-() ]{6,}/);
      });

    // Cart/account area should be present.
    cy.get("header")
      .find("#cart, .cart, .fa-shopping-cart, .icon-bag, [class*='cart']")
      .first()
      .should("exist");
  });

  it("opens mobile navigation from burger button", () => {
    cy.viewport(375, 812);
    cy.get("header").should("be.visible");

    cy.get("header")
      .find(
        ".navbar-toggle, .menu-btn, #menu .btn, .fa-bars, .fa-navicon, button[aria-label*='menu'], button[aria-label*='Menu']"
      )
      .first()
      .should("be.visible")
      .click({ force: true });

    cy.get(
      "#main-menu, .navbar-collapse, .collapse.in, .mobile-menu, .menu-open, nav"
    )
      .filter(":visible")
      .should("have.length.greaterThan", 0);
  });

  it("keeps top utility bar visible", () => {
    cy.get("#top, .top-menu, .topbar").first().should("be.visible");
  });
});
