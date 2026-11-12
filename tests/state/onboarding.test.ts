import { describe, expect, it } from "vitest";
import { defaultAppState, normalizeAppState, SCHEMA_VERSION } from "../../src/data/schema";
import { type AppStateAction, appStateReducer } from "../../src/state/core";

describe("local onboarding state", () => {
  it("starts fresh installs with guidance and keeps existing users past it", () => {
    expect(defaultAppState.settings).toMatchObject({ onboardingDismissed: false, calendarHelpDismissed: false });
    for (const settings of [undefined, {}, { onboardingDismissed: "false", calendarHelpDismissed: null }]) {
      expect(normalizeAppState({ schemaVersion: 4, settings }).settings).toMatchObject({
        onboardingDismissed: true,
        calendarHelpDismissed: true,
      });
    }
    expect(normalizeAppState({ schemaVersion: SCHEMA_VERSION, ...defaultAppState })).toEqual(defaultAppState);
  });

  it("dismisses onboarding on a new log and keeps it dismissed after undo", () => {
    const logged = appStateReducer(defaultAppState, {
      type: "togglePeriodDay",
      day: "2026-04-02",
      today: "2026-04-02",
    });
    expect(logged.settings.onboardingDismissed).toBe(true);
    expect(logged.settings.calendarHelpDismissed).toBe(false);
    expect(
      appStateReducer(logged, {
        type: "togglePeriodDay",
        day: "2026-04-02",
        today: "2026-04-02",
      }).settings.onboardingDismissed,
    ).toBe(true);
  });

  it("dismisses onboarding for a new range, flow log, or daily details", () => {
    for (const action of [
      { type: "logPeriodRange", from: "2026-04-01", to: "2026-04-02", today: "2026-04-02" },
      { type: "setDayIntensity", day: "2026-04-02", intensity: "light", today: "2026-04-02" },
      {
        type: "setDayDetails",
        day: "2026-04-02",
        today: "2026-04-02",
        details: { symptoms: [], mood: null, note: "" },
      },
    ] satisfies AppStateAction[]) {
      expect(appStateReducer(defaultAppState, action).settings.onboardingDismissed).toBe(true);
    }
  });

  it("keeps guidance for invalid, future, empty, and deletion-only changes", () => {
    for (const action of [
      { type: "togglePeriodDay", day: "2026-04-03", today: "2026-04-02" },
      { type: "togglePeriodDay", day: "2026-02-30", today: "2026-04-02" },
      { type: "setDayIntensity", day: "2026-02-30", intensity: "light", today: "2026-04-02" },
      { type: "logPeriodRange", from: "2026-04-03", to: "2026-04-04", today: "2026-04-02" },
      { type: "logPeriodRange", from: "2026-04-01", to: "2026-04-20", today: "2026-04-20" },
      {
        type: "setDayDetails",
        day: "2026-04-02",
        today: "2026-04-02",
        details: { symptoms: null, mood: null, note: "" },
      },
    ] satisfies AppStateAction[]) {
      expect(appStateReducer(defaultAppState, action).settings.onboardingDismissed).toBe(false);
    }
    const existing = { ...defaultAppState, intensityByDay: { "2026-04-02": null } };
    expect(
      appStateReducer(existing, { type: "togglePeriodDay", day: "2026-04-02", today: "2026-04-02" }).settings
        .onboardingDismissed,
    ).toBe(false);
    const details = {
      ...defaultAppState,
      detailsByDay: { "2026-04-02": { symptoms: null, mood: null, note: "A note" } },
    };
    expect(
      appStateReducer(details, {
        type: "setDayDetails",
        day: "2026-04-02",
        today: "2026-04-02",
        details: { symptoms: null, mood: null, note: "A note" },
      }).settings.onboardingDismissed,
    ).toBe(false);
    expect(
      appStateReducer(details, {
        type: "setDayDetails",
        day: "2026-04-02",
        today: "2026-04-02",
        details: { symptoms: null, mood: null, note: "" },
      }).settings.onboardingDismissed,
    ).toBe(false);
  });

  it("adopts another tab's dismissal flags wholesale", () => {
    const other = {
      ...defaultAppState,
      settings: { ...defaultAppState.settings, onboardingDismissed: true, calendarHelpDismissed: true },
    };
    expect(appStateReducer(defaultAppState, { type: "importState", state: other })).toBe(other);
    expect(appStateReducer(other, { type: "importState", state: defaultAppState })).toBe(defaultAppState);
  });
});
