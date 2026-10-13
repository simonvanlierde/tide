import { describe, expect, it, vi } from "vitest";
import { SCHEMA_VERSION } from "../../src/data/schema";
import {
  BACKUP_KEY,
  clearAppState,
  loadAppState,
  loadStoredState,
  STORAGE_KEY,
  saveAppState,
} from "../../src/data/storage";
import { createAppState } from "../support/app";

describe("local storage", () => {
  it("round-trips app state through a plain storage record", () => {
    const state = createAppState({
      periodDays: ["2026-04-02"],
      settings: {
        dismissedOn: "2026-04-01",
      },
    });

    saveAppState(state);

    expect(loadAppState()).toEqual(state);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "")).toEqual({
      schemaVersion: SCHEMA_VERSION,
      ...state,
    });
    // Our own saves never trigger the lossy-load backup.
    expect(window.localStorage.getItem(BACKUP_KEY)).toBeNull();
  });

  it("migrates an unversioned blob to the versioned shape on the next save", () => {
    const state = createAppState({ periodDays: ["2026-04-02"] });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const loaded = loadStoredState();
    expect(loaded).toEqual({ state, readOnly: false });
    saveAppState(loaded.state);

    expect(
      JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "").schemaVersion,
    ).toBe(SCHEMA_VERSION);
  });

  it("reads data from a newer build but marks it read-only", () => {
    const raw = JSON.stringify({
      schemaVersion: SCHEMA_VERSION + 1,
      intensityByDay: { "2026-04-02": "heavy" },
      settings: { theme: "dark" },
      symptomsByDay: { "2026-04-02": ["cramps"] },
    });
    window.localStorage.setItem(STORAGE_KEY, raw);

    expect(loadStoredState()).toEqual({
      state: createAppState({
        intensityByDay: { "2026-04-02": "heavy" },
        settings: { theme: "dark" },
      }),
      readOnly: true,
    });
    // Nothing is lost, so there is nothing to back up either.
    expect(window.localStorage.getItem(BACKUP_KEY)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(raw);
  });

  it("backs up the stored blob when normalizing it drops anything", () => {
    const raw = JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      intensityByDay: { "2026-04-02": "heavy", "2026-04-03": "torrential" },
      settings: createAppState().settings,
    });
    window.localStorage.setItem(STORAGE_KEY, raw);

    expect(loadAppState().intensityByDay).toEqual({ "2026-04-02": "heavy" });
    expect(window.localStorage.getItem(BACKUP_KEY)).toBe(raw);
  });

  it("recovers safely from corrupted local storage", () => {
    window.localStorage.setItem(STORAGE_KEY, "{ definitely not json");

    expect(loadAppState()).toEqual(createAppState());
  });

  it("fills in defaults for incomplete current-shape state", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        intensityByDay: { "2026-04-02": "medium" },
        settings: { dismissedOn: null },
      }),
    );

    expect(loadAppState()).toEqual(
      createAppState({
        periodDays: ["2026-04-02"],
        settings: {
          dismissedOn: null,
        },
      }),
    );
  });

  it("normalizes stored app data and removes invalid dates", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        intensityByDay: {
          "2026-04-02": "medium",
          "bad-date": "medium",
          "2026-03-20": "medium",
        },
        settings: {
          dismissedOn: "nope",
        },
      }),
    );

    expect(loadAppState()).toEqual(
      createAppState({
        periodDays: ["2026-03-20", "2026-04-02"],
        settings: {
          dismissedOn: null,
        },
      }),
    );
  });

  it("keeps only valid flow levels for logged days", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        intensityByDay: {
          "2026-04-02": "heavy", // valid -> kept
          "2026-04-03": "torrential", // invalid level -> dropped
          "2026-04-09": "light", // valid -> kept
        },
      }),
    );

    expect(loadAppState()).toEqual(
      createAppState({
        intensityByDay: { "2026-04-02": "heavy", "2026-04-09": "light" },
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

  it("starts with defaults when storage is blocked outright", () => {
    const blocked = () => {
      throw new DOMException("blocked", "SecurityError");
    };
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(blocked);
    const removeItem = vi
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(blocked);

    try {
      expect(loadAppState()).toEqual(createAppState());
      expect(() => clearAppState()).not.toThrow();
    } finally {
      getItem.mockRestore();
      removeItem.mockRestore();
    }
  });
});
