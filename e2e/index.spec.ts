import { test, expect } from "@playwright/test";

test("page loads without errors", async ({ page }) => {
  await page.goto("http://localhost:3000");
  const title = await page.title();
  expect(title).toContain("DeXter");
});
