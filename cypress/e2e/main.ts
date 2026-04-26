import { MainPage } from "../pageObjects/main.po";
import searchFixtures from "../fixtures/search-fixtures.json";

type SearchFixture = {
  query: string;
  expectedInTitle: string;
};

describe("DokaSport main page", () => {
  const mainPage = new MainPage();
  const searchCases = searchFixtures as SearchFixture[];

  beforeEach(() => {
    mainPage.visitHome();
  });

  it("shows main navigation and hero content", () => {
    cy.viewport(1366, 768);

    mainPage.getTopMenuNav().should("be.visible");
    mainPage.getHeroBanner().should("be.visible");
    mainPage.getRecommendedHeading().should("be.visible");
    mainPage.getProductCards().its("length").should("be.greaterThan", 0);
  });

  it("searches from header search input", () => {
    const query = "корсет";

    mainPage.getSearchInput().should("be.visible");
    mainPage.searchFor(query);

    cy.url().should("include", "search=");
    cy.url().should("include", encodeURIComponent(query));
  });

  it("shows category menu trigger on mobile", () => {
    cy.viewport(375, 812);

    mainPage.getTopMenuNav().should("be.visible");
    mainPage.getCategoryMenuButton().should("be.visible");
  });

  searchCases.forEach(({ query, expectedInTitle }) => {
    it(`shows filtered items for "${query}" and titles contain expected word`, () => {
      mainPage.getSearchInput().should("be.visible");
      mainPage.searchFor(query);

      cy.url().should("include", "search=");
      cy.url().should("include", encodeURIComponent(query));
      mainPage.getResultTitleLinks().its("length").should("be.greaterThan", 0);

      mainPage.getResultTitleLinks().each(($link) => {
        const title = ($link.text() || "").toLowerCase().trim();
        expect(title).to.contain(expectedInTitle.toLowerCase());
      });
    });
  });
});
