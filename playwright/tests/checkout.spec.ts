import checkoutFixture from "../../cypress/fixtures/checkout-fixtures.json";
import uaCountryZonesFixture from "../../cypress/fixtures/ua-country-zones.json";
import { test, expect } from "../fixtures/test-base";
import { checkPageReady } from "../helpers/page-ready";
import { CheckoutPage } from "../pages/checkout.page";

const { searchQuery } = checkoutFixture as { searchQuery: string };

type Zone = { zone_id: string; name: string; code: string; status: string; country_id?: string };
type CountryResponse = {
  country_id: string;
  name: string;
  iso_code_2: string;
  iso_code_3: string;
  postcode_required: string;
  status: string;
  zone: Zone[];
};

test.describe("DokaSport checkout with interceptors", () => {
  test.describe.configure({ mode: "serial" });

  test("intercepts add-to-cart and checkout requests", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    const addToCartPromise = page.waitForRequest(
      (req) =>
        req.method() === "POST" && /route=checkout\/cart\/add/.test(req.url()),
      { timeout: 60_000 }
    );

    await checkoutPage.visitHome();
    await checkPageReady(page);
    await checkoutPage.searchFor(searchQuery);
    await checkoutPage.openFirstProductFromResults();
    await checkoutPage.selectRequiredProductOptions();
    await checkoutPage.clickAddToCartOnProductPage();

    const addReq = await addToCartPromise;
    const postData = addReq.postData() || "";
    const headers = addReq.headers();
    const contentType = (headers["content-type"] || "").toLowerCase();
    let productIdInBody = false;
    if (contentType.includes("application/json") && postData) {
      try {
        const body = JSON.parse(postData) as { product_id?: string };
        productIdInBody = Boolean(body.product_id);
      } catch {
        productIdInBody = postData.includes("product_id");
      }
    } else {
      productIdInBody = postData.includes("product_id");
    }

    expect(
      productIdInBody || postData.includes("product_id"),
      "product id is passed in add-to-cart request"
    ).toBe(true);

    const addRes = await addReq.response();
    expect(addRes).toBeTruthy();
    const addStatus = addRes!.status();
    expect([200, 301, 302].includes(addStatus)).toBe(true);

    if (addStatus === 200) {
      const responseText = await addRes!.text();
      expect(/success|error|redirect/i.test(responseText), "server returns known add-to-cart payload").toBe(
        true
      );
    }

    const checkoutPromise = page.waitForRequest(
      (req) =>
        req.method() === "GET" && /\/index\.php\?route=checkout\/(uni_checkout|checkout)/.test(req.url()),
      { timeout: 60_000 }
    );

    await checkoutPage.openCartDropdown();
    await checkoutPage.clickCheckoutLinkIfVisible();

    const checkoutReq = await checkoutPromise;
    const checkoutRes = await checkoutReq.response();
    expect(checkoutRes).toBeTruthy();
    expect([200, 301, 302].includes(checkoutRes!.status())).toBe(true);
    expect(String(checkoutReq.url())).toMatch(/route=checkout\/(uni_checkout|checkout)/);

    const finalUrl = page.url();
    expect(
      finalUrl.includes("route=checkout/uni_checkout") ||
        finalUrl.includes("route=checkout/checkout") ||
        finalUrl.includes("checkout") ||
        finalUrl.includes("cart"),
      "user stays in quick checkout/checkout/cart flow"
    ).toBe(true);
  });

  test("uses UA country fixture for country/zone request", async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    const addToCartPromise = page.waitForRequest(
      (req) =>
        req.method() === "POST" && /route=checkout\/cart\/add/.test(req.url()),
      { timeout: 60_000 }
    );

    await checkoutPage.visitHome();
    await checkPageReady(page);
    await checkoutPage.searchFor(searchQuery);
    await checkoutPage.openFirstProductFromResults();
    await checkoutPage.selectRequiredProductOptions();
    await checkoutPage.clickAddToCartOnProductPage();

    const addReq = await addToCartPromise;
    const addRes = await addReq.response();
    expect(addRes).toBeTruthy();
    expect([200, 301, 302].includes(addRes!.status())).toBe(true);
    const addBodyText = await addRes!.text();
    expect(/success|redirect/i.test(addBodyText), "add-to-cart result indicates success or redirect").toBe(
      true
    );

    await checkoutPage.openCartDropdown();
    await checkoutPage.clickCheckoutLinkIfVisible();
    await page.goto("/index.php?route=checkout/uni_checkout");

    await page.route(
      (url: URL) =>
        /route=checkout\/(uni_checkout|checkout)\/country/.test(url.href) &&
        url.href.includes("country_id=220"),
      async (route) => {
        if (route.request().method() !== "GET") {
          await route.continue();
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(uaCountryZonesFixture)
        });
      }
    );

    const countryResponsePromise = page.waitForResponse(
      (r) =>
        r.url().includes("route=checkout/uni_checkout/country") &&
        r.url().includes("country_id=220") &&
        r.request().method() === "GET"
    );

    await page.evaluate(async () => {
      await fetch("/index.php?route=checkout/uni_checkout/country&country_id=220");
    });

    const countryRes = await countryResponsePromise;
    expect(countryRes.status()).toBe(200);
    const body = (await countryRes.json()) as CountryResponse;

    expect(body.country_id).toBe("220");
    expect(body.name).toBe("Украина");
    expect(body.iso_code_2).toBe("UA");
    expect(body.iso_code_3).toBe("UKR");
    expect(body.postcode_required).toBe("0");
    expect(body.status).toBe("1");

    expect(Array.isArray(body.zone)).toBe(true);
    expect(body.zone).toHaveLength(25);

    const kyiv = body.zone.find((z) => z.code === "KY");
    expect(kyiv, "Kyiv zone exists").toBeTruthy();
    expect(kyiv!.name).toBe("Киев");
    expect(kyiv!.zone_id).toBe("139");
    expect(kyiv!.status).toBe("1");

    expect(body.zone.every((z) => z.country_id === "220")).toBe(true);
    expect(body.zone.every((z) => z.status === "1")).toBe(true);
  });
});
