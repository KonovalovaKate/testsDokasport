import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function checkPageReady(page: Page): Promise<void> {
  await expect(page.locator("body")).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("header").first()).toBeAttached({ timeout: 15_000 });
}
