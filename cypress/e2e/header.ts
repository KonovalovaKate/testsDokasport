import { HeaderPage } from "../pageObjects/header.po";

describe("DokaSport header", () => {
  const headerPage = new HeaderPage();

  beforeEach(() => {
    headerPage.visitHome();
    cy.checkPageReady();
  });

  it("shows core header structure on desktop", () => {
    cy.viewport(1366, 768);

    headerPage.getHeader().should("be.visible");
    headerPage.getHeaderContainer().should("be.visible");

    // Logo block should exist and navigate home when clicked.
    headerPage
      .getLogoLink()
      .should("be.visible")
      .and(($a: JQuery<HTMLElement>) => {
        const href = $a.attr("href") || "";
        expect(href).to.match(/\/$/);
      });

    // Phone/contact area should contain at least one visible number-like value.
    headerPage.getHeaderText().then((text: string) => {
      const normalized = text.replace(/\s+/g, " ").trim();
      expect(normalized).to.match(/\+?\d[\d\-() ]{6,}/);
    });

    // Cart/account area should be present.
    headerPage.getCartArea().should("exist");
  });

  it("opens mobile navigation from burger button", () => {
    cy.viewport(375, 812);
    headerPage.getHeader().should("be.visible");
    headerPage.clickBurgerButton();
    headerPage.getVisibleMobileNav().should("have.length.greaterThan", 0);
  });

  it("keeps top utility bar visible", () => {
    headerPage.getTopUtilityBar().should("be.visible");
  });
});
