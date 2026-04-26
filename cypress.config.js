const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://dokasport.com.ua",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    video: false,
    defaultCommandTimeout: 10000
  },
  viewportWidth: 1366,
  viewportHeight: 768
});
