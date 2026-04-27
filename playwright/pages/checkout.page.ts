import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

const selectors = {
  searchInput:
    "#search2 input[type='text'], #search input[type='text'], .header-search input[type='text'], input[name='search']",
    firstProductLink:
      "#content .product-thumb .image a, #content .product-item .image a, #content .product-layout .image a, #content .product-thumb .caption h4 a, #content .product-layout .caption h4 a, .product-thumb .caption h4 a, .product-layout .caption h4 a, #content a[href*='product_id=']",
  productPageAddToCartButton: "#button-cart, button#button-cart, .product-info #button-cart",
  requiredOptionGroups: ".form-group.required, .required",
  cartButton: "#cart > button, #cart .btn, #cart button",
  checkoutLink:
    "#cart a[href*='route=checkout/uni_checkout'], a[href*='route=checkout/uni_checkout'], #cart a[href*='route=checkout/checkout'], a[href*='route=checkout/checkout'], .dropdown-menu a[href*='uni_checkout'], .dropdown-menu a[href*='checkout']"
} as const;

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async visitHome(): Promise<void> {
    await this.page.goto("/");
  }

  async searchFor(query: string): Promise<void> {
    const input = this.page.locator(selectors.searchInput).first();
    await input.clear({ force: true });
    await input.fill(query);
    await input.press("Enter");
  }

  async openFirstProductFromResults(): Promise<void> {
    const parts = selectors.firstProductLink.split(", ").map((s) => s.trim());
    for (const sel of parts) {
      const loc = this.page.locator(sel);
      if ((await loc.count()) === 0) {
        continue;
      }
      const link = loc.first();
      try {
        await link.waitFor({ state: "visible", timeout: 15_000 });
        await link.scrollIntoViewIfNeeded({ timeout: 15_000 });
        await link.click({ force: true });
        return;
      } catch {
        continue;
      }
    }
    throw new Error("No product link found in search results");
  }

  async selectRequiredProductOptions(): Promise<void> {
    // Journal / custom themes: colour + size are often outside `.form-group.required` or use `..` chains that miss the real swatch row.
    const colourLabel = this.page.getByText("* Колір:", { exact: true }).first();
    if ((await colourLabel.count()) > 0) {
      const colourSwatch = colourLabel.locator("xpath=following::img[@alt][1]");
      if ((await colourSwatch.count()) > 0) {
        await colourSwatch.click({ force: true });
      }
    }
    const sizeLabel = this.page.getByText("* Розмір:", { exact: true }).first();
    if ((await sizeLabel.count()) > 0) {
      const sizeChip = sizeLabel.locator(
        "xpath=following::*[self::div or self::span or self::a or self::button][normalize-space(.)='XS' or normalize-space(.)='S' or normalize-space(.)='M' or normalize-space(.)='L' or normalize-space(.)='XL'][1]"
      );
      if ((await sizeChip.count()) > 0) {
        await sizeChip.click({ force: true });
      }
    }

    const groups = this.page.locator(selectors.requiredOptionGroups);
    const count = await groups.count();
    for (let i = 0; i < count; i++) {
      const group = groups.nth(i);
      const radio = group.locator("input[type='radio']:enabled").first();
      if ((await radio.count()) > 0) {
        await radio.evaluate((el: HTMLInputElement) => {
          el.checked = true;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        });
        continue;
      }
      const checkbox = group.locator("input[type='checkbox']:enabled").first();
      if ((await checkbox.count()) > 0) {
        await checkbox.check({ force: true });
        continue;
      }
      const select = group.locator("select:enabled").first();
      if ((await select.count()) > 0) {
        const options = select.locator("option");
        const optCount = await options.count();
        for (let j = 0; j < optCount; j++) {
          const opt = options.nth(j);
          const value = await opt.getAttribute("value");
          if (value && value !== "") {
            await select.selectOption(value, { force: true });
            break;
          }
        }
        continue;
      }
      const textInput = group.locator("input[type='text']:enabled, textarea:enabled").first();
      if ((await textInput.count()) > 0) {
        await textInput.clear({ force: true });
        await textInput.fill("test", { force: true });
      }
    }
  }

  async clickAddToCartOnProductPage(): Promise<void> {
    const btn = this.page.locator(selectors.productPageAddToCartButton).first();
    await expect(btn).toBeEnabled({ timeout: 15_000 });
    await btn.scrollIntoViewIfNeeded();
    await btn.click({ force: true });
  }

  async openCartDropdown(): Promise<void> {
    await this.page.locator(selectors.cartButton).first().click({ force: true });
  }

  async clickCheckoutLinkIfVisible(): Promise<void> {
    const links = this.page.locator(selectors.checkoutLink);
    if ((await links.count()) > 0) {
      await links.first().click({ force: true });
    } else {
      await this.page.goto("/index.php?route=checkout/uni_checkout");
    }
  }
}
