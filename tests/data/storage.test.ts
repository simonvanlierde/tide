import { describe, expect, it } from "vitest";
import {
  loadAppState,
  saveAppState,
  STORAGE_KEY,
} from "../../src/data/storage";
import { createAppState } from "../support/app";

describe("local storage", () => {
  it("round-trips app state through a plain storage record", () => {
    const state = createAppState({
      periodDays: ["2026-04-02"],
      settings: {
        reminderWindowDays: 4,
        snoozedUntil: null,
        homeDisplayMode: "summary",
      },
    });

    saveAppState(state);

    expect(loadAppState()).toEqual(state);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "")).toEqual(
      state,
    );
  });

  it("recovers safely from corrupted local storage", () => {
    window.localStorage.setItem(STORAGE_KEY, "{ definitely not json");

    expect(loadAppState()).toEqual(createAppState());
  });

  it("fills in defaults for incomplete current-shape state", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        periodDays: ["2026-04-02"],
        settings: { reminderWindowDays: 4, snoozedUntil: null },
      }),
    );

    expect(loadAppState()).toEqual(
      createAppState({
        periodDays: ["2026-04-02"],
        settings: {
          reminderWindowDays: 4,
          snoozedUntil: null,
          homeDisplayMode: "summary",
        },
      }),
    );
  });

  it("normalizes stored app data and removes invalid dates", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        periodDays: [
          "2026-04-02",
          "bad-date",
          "2026-04-02",
          "2026-03-20",
          123,
        ],
        settings: {
          reminderWindowDays: "nope",
          snoozedUntil: "2026-04-22",
          homeDisplayMode: "gallery",
        },
      }),
    );

    expect(loadAppState()).toEqual(
      createAppState({
        periodDays: ["2026-03-20", "2026-04-02"],
        settings: {
          reminderWindowDays: 4,
          snoozedUntil: "2026-04-22",
          homeDisplayMode: "summary",
        },
      }),
    );
  });

  it("resets to defaults when it encounters the removed versioned envelope", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: createAppState({
          periodDays: ["2026-04-02"],
        }),
      }),
    );

    expect(loadAppState()).toEqual(createAppState());
  });
});
