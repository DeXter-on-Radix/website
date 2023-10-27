import { test, expect } from "@playwright/test";

test("page loads without errors", async ({ page }) => {
  await page.goto("/");
  const title = await page.title();
  expect(title).toContain("DeXter");
});

test("connects to AlphaDEX", async ({ page }) => {
  await page.goto("/");

  // Create a promise that resolves when the desired console text appears
  const waitForConsoleText = (pattern: RegExp): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      // Set a timeout to reject the promise if the message doesn't appear within a certain time
      const timeout = setTimeout(() => {
        reject(
          new Error(
            `Timed out waiting for console message matching pattern: ${pattern}`
          )
        );
      }, 10000); // 10 seconds, adjust as needed

      page.on("console", (msg) => {
        if (pattern.test(msg.text())) {
          clearTimeout(timeout); // Clear the timeout if the message is found
          resolve();
        }
      });
    });
  };

  // Wait for connection
  await waitForConsoleText(
    /Websocket connection \d+ established with AlphaDEX/
  );

  // A pair should appear in the pair selector
  await expect(page.locator("#pair-selector-text")).toHaveText(/^.* - .*$/);
});

// TODO: after MVP
// check all the components that do not require wallet connection
// to be present on the page
