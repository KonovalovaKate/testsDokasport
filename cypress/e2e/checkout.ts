import checkoutFixture from "../fixtures/checkout-fixtures.json";
import { CheckoutPage } from "../pageObjects/checkout.po";

describe("DokaSport checkout with interceptors", () => {
  const checkoutPage = new CheckoutPage();
  const { searchQuery } = checkoutFixture as { searchQuery: string };

  it("intercepts add-to-cart and checkout requests", () => {
    cy.intercept("POST", "**/index.php?route=checkout/cart/add*").as("addToCartRequest");
    cy.intercept(
      {
        method: "GET",
        url: /\/index\.php\?route=checkout\/(uni_checkout|checkout).*/
      },
      (req) => {
        req.alias = "checkoutRequest";
      }
    );

    checkoutPage.visitHome();
    checkoutPage.searchFor(searchQuery);
    checkoutPage.openFirstProductFromResults();
    checkoutPage.selectRequiredProductOptions();
    checkoutPage.clickAddToCartOnProductPage();

    cy.wait("@addToCartRequest").then((interception) => {
      const requestBody = interception.request.body;
      const requestBodyText =
        typeof requestBody === "string" ? requestBody : JSON.stringify(requestBody || {});
      const productId =
        typeof requestBody === "object" && requestBody !== null
          ? (requestBody as { product_id?: string }).product_id
          : undefined;

      expect(
        Boolean(productId) || requestBodyText.includes("product_id"),
        "product id is passed in add-to-cart request"
      ).to.eq(true);
      expect(interception.response?.statusCode).to.be.oneOf([200, 301, 302]);

      if (interception.response?.statusCode === 200) {
        const responseBody = interception.response.body;
        const responseText =
          typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody || {});
        expect(
          /success|error|redirect/i.test(responseText),
          "server returns known add-to-cart payload"
        ).to.eq(true);
      }
    });

    checkoutPage.openCartDropdown();
    checkoutPage.clickCheckoutLinkIfVisible();

    cy.wait("@checkoutRequest").then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 301, 302]);
      expect(String(interception.request.url)).to.match(
        /route=checkout\/(uni_checkout|checkout)/,
        "checkout request targets standard or quick checkout route"
      );
    });

    cy.url().should((url) => {
      expect(
        url.includes("route=checkout/uni_checkout") ||
          url.includes("route=checkout/checkout") ||
          url.includes("checkout") ||
          url.includes("cart"),
        "user stays in quick checkout/checkout/cart flow"
      ).to.eq(true);
    });
  });
});
