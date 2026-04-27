import checkoutFixture from "../fixtures/checkout-fixtures.json";
import uaCountryZonesFixture from "../fixtures/ua-country-zones.json";
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
    cy.checkPageReady();
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

  it("uses UA country fixture for country/zone request", () => {
    cy.intercept("POST", "**/index.php?route=checkout/cart/add*").as("addToCartRequest");
    cy.intercept(
      {
        method: "GET",
        url: /\/index\.php\?route=checkout\/(uni_checkout|checkout)\/country(&|%26)country_id=220.*/
      },
      {
        statusCode: 200,
        body: uaCountryZonesFixture
      }
    ).as("countryRequest");

    checkoutPage.visitHome();
    cy.checkPageReady();
    checkoutPage.searchFor(searchQuery);
    checkoutPage.openFirstProductFromResults();
    checkoutPage.selectRequiredProductOptions();
    checkoutPage.clickAddToCartOnProductPage();

    cy.wait("@addToCartRequest").then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 301, 302]);
      const responseBody = interception.response?.body;
      const responseText = typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody || {});
      expect(/success|redirect/i.test(responseText), "add-to-cart result indicates success or redirect").to.eq(true);
      expect(/error/i.test(responseText), "add-to-cart result should not contain error").to.eq(false);
    });

    checkoutPage.openCartDropdown();
    checkoutPage.clickCheckoutLinkIfVisible();
    cy.visit("/index.php?route=checkout/uni_checkout");

    cy.window().then((win) => {
      return win.fetch("/index.php?route=checkout/uni_checkout/country&country_id=220");
    });

    cy.wait("@countryRequest").then((interception) => {
      type Zone = { zone_id: string; name: string; code: string; status: string };
      type CountryResponse = {
        country_id: string;
        name: string;
        iso_code_2: string;
        iso_code_3: string;
        postcode_required: string;
        status: string;
        zone: Zone[];
      };

      const body = interception.response?.body as CountryResponse;

      expect(interception.response?.statusCode).to.eq(200);
      expect(body.country_id).to.eq("220");
      expect(body.name).to.eq("Украина");
      expect(body.iso_code_2).to.eq("UA");
      expect(body.iso_code_3).to.eq("UKR");
      expect(body.postcode_required).to.eq("0");
      expect(body.status).to.eq("1");

      expect(body.zone).to.be.an("array").and.have.length(25);

      const kyiv = body.zone.find((z) => z.code === "KY");
      expect(kyiv, "Kyiv zone exists").to.exist;
      expect(kyiv?.name).to.eq("Киев");
      expect(kyiv?.zone_id).to.eq("139");
      expect(kyiv?.status).to.eq("1");

      expect(body.zone.every((z) => z.country_id === "220")).to.eq(true);
      expect(body.zone.every((z) => z.status === "1")).to.eq(true);
    });
  });
});
