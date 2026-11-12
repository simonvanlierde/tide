import { expect, test } from "@playwright/test";
import { FIXED_NOW, seedAppState } from "./seed";

const history = Object.fromEntries(
  ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"].map((day) => [day, "medium"]),
);

test("Calendar receipt updates atomically and expires without removing the log", async ({ page }) => {
  await page.clock.install({ time: FIXED_NOW });
  await seedAppState(page, "en", {}, history);
  await page.goto("/calendar");
  await page.locator(".calendar").waitFor();
  await page.evaluate(() => {
    const statuses: string[] = [];
    Object.assign(window, { calendarStatuses: statuses });
    new MutationObserver((records) => {
      const text = document.querySelector(".calendar__help[role=status]")?.textContent;
      if (text) statuses.push(text);
      for (const record of records) {
        if (record.oldValue) statuses.push(record.oldValue);
      }
    }).observe(document.querySelector(".calendar") as Element, {
      subtree: true,
      childList: true,
      characterData: true,
      characterDataOldValue: true,
    });
  });
  await page.getByRole("button", { name: /^Log April 15, 2026/ }).click();
  const receipt = page.locator(".calendar__help[role=status]");
  await expect(receipt).toHaveText("Logged Wed, Apr 15. Forecast updated. Undo");
  const statuses = await page.evaluate(() => (window as unknown as { calendarStatuses: string[] }).calendarStatuses);
  expect(statuses.filter((text) => text.includes("Logged Wed, Apr 15."))).not.toEqual([]);
  expect(
    statuses.filter((text) => text.includes("Logged Wed, Apr 15.") && !text.includes("Forecast updated.")),
  ).toEqual([]);
  await page.clock.fastForward(10000);
  await expect(receipt).not.toBeVisible();
  await expect(page.getByRole("button", { name: /^Edit April 15, 2026/ })).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("tide.period-tracker.state") ?? "{}").intensityByDay["2026-04-15"],
    ),
  ).toBeNull();
});

test("Calendar Undo stays while hovered or focused and expires after leaving both", async ({ page }) => {
  await page.clock.install({ time: FIXED_NOW });
  await seedAppState(page, "en", {}, history);
  await page.goto("/calendar");
  await page.getByRole("button", { name: /^Log April 15, 2026/ }).click();
  const receipt = page.locator(".calendar__help[role=status]");
  const undo = receipt.getByRole("button", { name: "Undo", exact: true });
  await receipt.hover();
  await page.clock.fastForward(11000);
  await expect(undo).toBeVisible();
  await undo.focus();
  await page.mouse.move(0, 0);
  await page.clock.fastForward(11000);
  await expect(undo).toBeFocused();
  await page.getByRole("button", { name: /^Edit April 15, 2026/ }).focus();
  await page.clock.fastForward(9000);
  await expect(undo).toBeVisible();
  await page.clock.fastForward(1100);
  await expect(receipt).not.toBeVisible();
});
