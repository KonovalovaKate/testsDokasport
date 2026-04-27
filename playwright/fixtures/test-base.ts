import { test as base } from "@playwright/test";

/** Mirrors Cypress uncaught:exception handler — third-party script errors do not fail tests. */
export const test = base.extend({
  page: async ({ page }, use) => {
    page.on("pageerror", () => {});
    await use(page);
  }
});

export { expect } from "@playwright/test";
