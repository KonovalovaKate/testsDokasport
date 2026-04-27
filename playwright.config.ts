import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright/tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "https://dokasport.com.ua",
    trace: "off",
    video: "off",
    viewport: { width: 1366, height: 768 },
    actionTimeout: 10_000,
    navigationTimeout: 30_000
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
