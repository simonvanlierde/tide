// biome-ignore lint/correctness/noNodejsModules: this check runs in Node, outside the browser.
import { readFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import { defaultAppState } from "../../src/data/schema";
import { loadStoredState, saveAppState } from "../../src/data/storage";
import { downloadAppState, parseImportedState } from "../../src/data/transfer";

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

it("exports and restores the documented schema 5 example without losing persistent data", async () => {
  const example = JSON.parse(readFileSync("docs/backup-example.json", "utf8"));
  const state = {
    intensityByDay: example.days,
    detailsByDay: example.detailsByDay,
    incompleteCycleStarts: example.incompleteCycleStarts,
    settings: { ...defaultAppState.settings, ...example.settings },
  };
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:backup-example");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

  downloadAppState(state);
  const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
  const text = await blob.text();
  expect(JSON.parse(text)).toEqual(example);
  const restored = parseImportedState(text, "2026-03-01");
  const restoredState = {
    ...state,
    settings: { ...state.settings, onboardingDismissed: true, calendarHelpDismissed: true },
  };
  expect(restored).toEqual(restoredState);
  expect(saveAppState(restored)).toBe(true);
  expect(loadStoredState()).toEqual({ state: restoredState, readOnly: false });
});
