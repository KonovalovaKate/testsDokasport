export class CheckoutPage {
  private readonly selectors = {
    searchInput:
      "#search2 input[type='text'], #search input[type='text'], .header-search input[type='text'], input[name='search']",
    firstAddToCartButton:
      ".product-thumb button[onclick*='cart.add'], .product-layout button[onclick*='cart.add'], button[onclick*='cart.add']",
    firstProductLink:
      ".product-thumb .caption h4 a, .product-layout .caption h4 a, #content a[href*='product_id=']",
    productPageAddToCartButton: "#button-cart, button#button-cart, .product-info #button-cart",
    requiredOptionGroups: ".form-group.required, .required",
    cartButton: "#cart > button, #cart .btn, #cart button",
    checkoutLink:
      "#cart a[href*='route=checkout/uni_checkout'], a[href*='route=checkout/uni_checkout'], #cart a[href*='route=checkout/checkout'], a[href*='route=checkout/checkout'], .dropdown-menu a[href*='uni_checkout'], .dropdown-menu a[href*='checkout']"
  };

  visitHome(): void {
    cy.visit("/");
  }

  searchFor(query: string): void {
    cy.get(this.selectors.searchInput).first().clear({ force: true }).type(`${query}{enter}`, {
      force: true
    });
  }

  clickFirstAddToCart(): void {
    cy.get(this.selectors.firstAddToCartButton).first().should("be.visible").click({ force: true });
  }

  openFirstProductFromResults(): void {
    cy.get(this.selectors.firstProductLink).first().should("be.visible").click({ force: true });
  }

  selectRequiredProductOptions(): void {
    cy.get("body").then(($body) => {
      if ($body.find(this.selectors.requiredOptionGroups).length === 0) {
        return;
      }

      cy.get(this.selectors.requiredOptionGroups).each(($group) => {
        const $radios = $group.find("input[type='radio']:enabled");
        const $checkboxes = $group.find("input[type='checkbox']:enabled");
        const $select = $group.find("select:enabled");
        const $textInput = $group.find("input[type='text']:enabled, textarea:enabled");

        if ($radios.length > 0) {
          cy.wrap($radios[0]).check({ force: true });
          return;
        }

        if ($checkboxes.length > 0) {
          cy.wrap($checkboxes[0]).check({ force: true });
          return;
        }

        if ($select.length > 0) {
          cy.wrap($select[0])
            .find("option")
            .then(($options) => {
              const valid = Array.from($options).find((opt) => (opt.getAttribute("value") || "") !== "");
              if (valid) {
                cy.wrap($select[0]).select(valid.getAttribute("value") as string, { force: true });
              }
            });
          return;
        }

        if ($textInput.length > 0) {
          cy.wrap($textInput[0]).clear({ force: true }).type("test", { force: true });
        }
      });
    });
  }

  clickAddToCartOnProductPage(): void {
    cy.get(this.selectors.productPageAddToCartButton).first().should("be.visible").click({ force: true });
  }

  openCartDropdown(): void {
    cy.get(this.selectors.cartButton).first().click({ force: true });
  }

  clickCheckoutLinkIfVisible(): void {
    cy.get("body").then(($body) => {
      if ($body.find(this.selectors.checkoutLink).length > 0) {
        cy.get(this.selectors.checkoutLink).first().click({ force: true });
      } else {
        cy.visit("/index.php?route=checkout/uni_checkout");
      }
    });
  }
}
