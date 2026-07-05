import { describe, expect, it, vi } from "vitest";
import {
  BACKUP_KEY,
  loadAppState,
  STORAGE_KEY,
  saveAppState,
} from "../../src/data/storage";
import { createAppState } from "../support/app";

describe("local storage", () => {
  it("round-trips app state through a plain storage record", () => {
    const state = createAppState({
      periodDays: ["2026-04-02"],
      settings: {
        reminderWindowDays: 4,
        snoozedUntil: null,
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
        },
      }),
    );
  });

  it("normalizes stored app data and removes invalid dates", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        periodDays: ["2026-04-02", "bad-date", "2026-04-02", "2026-03-20", 123],
        settings: {
          reminderWindowDays: "nope",
          snoozedUntil: "2026-04-22",
        },
      }),
    );

    expect(loadAppState()).toEqual(
      createAppState({
        periodDays: ["2026-03-20", "2026-04-02"],
        settings: {
          reminderWindowDays: 4,
          snoozedUntil: "2026-04-22",
        },
      }),
    );
  });

  it("recovers logged data from the legacy versioned envelope", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: createAppState({
          periodDays: ["2026-04-02"],
        }),
      }),
    );

    expect(loadAppState()).toEqual(
      createAppState({ periodDays: ["2026-04-02"] }),
    );
  });

  it("backs up an unreadable blob before falling back to defaults", () => {
    window.localStorage.setItem(STORAGE_KEY, "{ definitely not json");

    expect(loadAppState()).toEqual(createAppState());
    expect(window.localStorage.getItem(BACKUP_KEY)).toBe(
      "{ definitely not json",
    );
  });

  it("keeps running when storage writes fail", () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("quota", "QuotaExceededError");
      });

    try {
      expect(() => saveAppState(createAppState())).not.toThrow();
    } finally {
      setItem.mockRestore();
    }
  });
});
