import { expect, test } from "@playwright/test";

test("home screen shows the Today view and privacy-first messaging", async ({
  page
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  await expect(page.getByText(/^Day /)).toBeVisible();
  await expect(page.getByText(/stays on this device/i)).toBeVisible();
});
