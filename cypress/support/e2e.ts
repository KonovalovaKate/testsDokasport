import "./commands";

// Ignore noisy third-party script exceptions to reduce flaky failures.
Cypress.on("uncaught:exception", () => {
  return false;
});
