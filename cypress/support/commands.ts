export {};

declare global {
  namespace Cypress {
    interface Chainable {
      checkPageReady(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("checkPageReady", () => {
  cy.location("pathname", { timeout: 15000 }).should("not.include", "__/#/specs/runner");
  cy.get("body", { timeout: 15000 }).should("be.visible");
  cy.get("header", { timeout: 15000 }).should("exist");
});
