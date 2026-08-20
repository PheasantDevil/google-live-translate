import { test, expect } from "@playwright/test";

test.describe("Live Translate UI", () => {
  test("renders main controls", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Live Translate" })).toBeVisible();
    await expect(page.getByRole("button", { name: "翻訳を開始" })).toBeVisible();
    await expect(page.getByText("翻訳先の言語")).toBeVisible();
    await expect(page.getByText("出力デバイス").first()).toBeVisible();
    await expect(page.getByText("待機中")).toBeVisible();
  });

  test("allows selecting target language before start", async ({ page }) => {
    await page.goto("/");

    const selector = page.locator("select");
    await selector.selectOption("en");
    await expect(selector).toHaveValue("en");
  });

  test("design document is accessible", async ({ page }) => {
    await page.goto("/docs/design.html");
    await expect(page.getByRole("heading", { name: /google-live-translate/ })).toBeVisible();
  });
});
