import { describe, expect, it } from "vitest";
import { mergeImportedDays } from "../../src/data/transfer";
import { appStateReducer } from "../../src/state/core";
import { createAppState } from "../support/app";

const calendarId = "3f2b8c1e-9a4d-4e7b-b6f0-2c5d8a1e7f93";
const today = "2026-04-05";
const initial = () => createAppState({ periodDays: ["2026-03-01", "2026-03-29"], settings: { calendarId } });

describe("calendar event identity", () => {
  it.each(["2026-02-01", "2026-03-01"] as const)(
    "starts a new calendar after changing older cycle starts: %s",
    (day) => {
      const next = appStateReducer(initial(), { type: "togglePeriodDay", day, today });
      expect(next.settings.calendarId).toBeNull();
    },
  );

  it("starts a new calendar after merging older history", () => {
    const next = mergeImportedDays(initial(), { "2026-02-01": null });
    expect(next.settings.calendarId).toBeNull();
  });

  it("keeps event identities when a new latest cycle is logged", () => {
    const next = appStateReducer(initial(), { type: "togglePeriodDay", day: "2026-04-26", today: "2026-04-26" });
    expect(next.settings.calendarId).toBe(calendarId);
  });

  it("keeps event identities for flow edits and incomplete markers", () => {
    const flow = appStateReducer(initial(), { type: "setDayIntensity", day: "2026-03-01", intensity: "heavy", today });
    const marked = appStateReducer(flow, { type: "toggleIncompleteCycle", start: "2026-03-01", today });
    expect(marked.settings.calendarId).toBe(calendarId);
  });
});
