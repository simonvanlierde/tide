import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  defaultAppState,
  normalizeAppState,
  SCHEMA_VERSION,
} from "../../src/data/schema";

describe("schema normalization at the storage trust boundary", () => {
  it("returns default state when the persisted blob is not an object", () => {
    expect(normalizeAppState("garbage")).toEqual(defaultAppState);
    expect(normalizeAppState(null)).toEqual(defaultAppState);
  });

  it("drops dates that match the shape but overflow the month", () => {
    const state = normalizeAppState({
      intensityByDay: {
        "2023-02-29": "heavy", // not a leap year
        "2026-04-31": "light",
        "2024-02-29": "medium", // leap year: valid
      },
    });
    expect(Object.keys(state.intensityByDay)).toEqual(["2024-02-29"]);
  });

  it("falls back to default settings for unknown enum values and non-booleans", () => {
    const state = normalizeAppState({
      intensityByDay: {},
      settings: {
        theme: "sepia",
        language: "xx",
        showFertility: "yes",
        showCycleDayNumbers: 1,
        // Would end the UID line and start a new one in a calendar file.
        calendarId: "x\r\nBEGIN:VEVENT",
      },
    });
    expect(state.settings).toEqual(defaultAppState.settings);
  });

  it("keeps a calendar id of the shape crypto.randomUUID makes", () => {
    const calendarId = "3f2b8c1e-9a4d-4e7b-b6f0-2c5d8a1e7f93";
    expect(normalizeAppState({ settings: { calendarId } }).settings).toEqual({
      ...defaultAppState.settings,
      calendarId,
    });
  });

  it("asks again where showFertility was only ever the old default", () => {
    // Before version 2, true was the default nobody chose: back to unasked.
    for (const blob of [
      { settings: { showFertility: true } },
      { schemaVersion: 1, settings: { showFertility: true } },
    ]) {
      expect(normalizeAppState(blob).settings.showFertility).toBeNull();
    }
    // false could only come from the Settings switch, so it is an answer.
    expect(
      normalizeAppState({
        schemaVersion: 1,
        settings: { showFertility: false },
      }).settings.showFertility,
    ).toBe(false);
    // From version 2 on, true is an answer too.
    expect(
      normalizeAppState({ schemaVersion: 2, settings: { showFertility: true } })
        .settings.showFertility,
    ).toBe(true);
    expect(
      normalizeAppState({ schemaVersion: 2, settings: { showFertility: null } })
        .settings.showFertility,
    ).toBeNull();
  });
});

describe("normalizeAppState properties", () => {
  // Junk of every kind, plus blobs shaped like a stored state or a backup so
  // the day and settings readers see near-misses, not only random values.
  const dayKey = fc.oneof(
    fc
      .date({ noInvalidDate: true })
      .map((date) => date.toISOString().slice(0, 10)),
    fc.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    fc.string(),
  );
  const flow = fc.oneof(
    fc.constantFrom(null, "spotting", "light", "medium", "heavy"),
    fc.anything(),
  );
  const days = fc.dictionary(dayKey, flow);
  const settings = fc.record(
    {
      dismissedOn: fc.oneof(dayKey, fc.anything()),
      showFertility: fc.oneof(fc.boolean(), fc.constant(null), fc.anything()),
      showCycleDayNumbers: fc.oneof(fc.boolean(), fc.anything()),
      theme: fc.oneof(fc.constantFrom("system", "light", "dark"), fc.string()),
      language: fc.oneof(fc.constantFrom("system", "en", "nl"), fc.string()),
      calendarId: fc.oneof(fc.uuid(), fc.string(), fc.constant(null)),
    },
    { requiredKeys: [] },
  );
  const stateLike = fc.record(
    {
      schemaVersion: fc.oneof(
        fc.constant(SCHEMA_VERSION),
        fc.integer({ min: 0, max: 3 }),
        fc.anything(),
      ),
      intensityByDay: days,
      days,
      settings: fc.oneof(settings, fc.anything()),
    },
    { requiredKeys: [] },
  );
  const blob = fc.oneof(
    fc.anything(),
    fc.jsonValue(),
    stateLike,
    stateLike.map((state) => ({ version: 1, state })),
  );

  it("never throws", () => {
    fc.assert(
      fc.property(blob, (value) => {
        normalizeAppState(value);
      }),
    );
  });

  // Normalised the way it is saved: storage and backups both stamp the
  // version, and a blob without one is read as pre-version-2 (see
  // normalizeAppState), whose showFertility: true means "not asked".
  it("gives the same state when normalising a saved state again", () => {
    fc.assert(
      fc.property(blob, (value) => {
        const once = normalizeAppState(value);
        expect(
          normalizeAppState({ schemaVersion: SCHEMA_VERSION, ...once }),
        ).toEqual(once);
      }),
    );
  });
});
