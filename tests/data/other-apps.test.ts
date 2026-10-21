import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { parseOtherAppExport } from "../../src/data/otherApps";
import { isIsoDate } from "../../src/data/schema";
import { mergeImportedDays } from "../../src/data/transfer";
import { createAppState } from "../support/app";

const TODAY = "2026-04-10";
const parse = (data: unknown) => parseOtherAppExport(JSON.stringify(data), TODAY);

describe("parseOtherAppExport: Clue measurements.json", () => {
  it("maps Clue flow onto Tide's levels and ignores other measurement types", () => {
    expect(
      parse([
        { date: "2026-03-01", type: "period", value: { option: "light" } },
        { date: "2026-03-02", type: "period", value: { option: "medium" } },
        { date: "2026-03-03", type: "period", value: { option: "heavy" } },
        { date: "2026-03-04", type: "period", value: { option: "very_heavy" } },
        { date: "2026-03-05", type: "period", value: { option: "gushing" } },
        { date: "2026-03-06", type: "spotting", value: { option: "spotting" } },
        { date: "2026-03-07", type: "pain", value: { option: "cramps" } },
        { date: "2026-03-08", type: "feelings", value: { option: "happy" } },
      ]),
    ).toEqual({
      source: "Clue",
      days: {
        "2026-03-01": "light",
        "2026-03-02": "medium",
        "2026-03-03": "heavy",
        "2026-03-04": "heavy",
        // An unknown flow word still marks a bleeding day, with no level.
        "2026-03-05": null,
        "2026-03-06": "spotting",
      },
    });
  });

  it("keeps the heaviest entry for a duplicated date and skips bad entries", () => {
    expect(
      parse([
        { date: "2026-03-01", type: "spotting" },
        { date: "2026-03-01", type: "period", value: { option: "light" } },
        { date: "2026-03-01", type: "period", value: { option: "medium" } },
        { date: "2026-03-02", type: "period", value: { option: "heavy" } },
        { date: "2026-03-02", type: "spotting" },
        { date: "2026-02-30", type: "period", value: { option: "heavy" } },
        { date: "yesterday", type: "period", value: { option: "heavy" } },
        { date: 20260303, type: "period" },
        { type: "period", value: { option: "heavy" } },
        null,
        "noise",
      ]),
    ).toEqual({
      source: "Clue",
      days: { "2026-03-01": "medium", "2026-03-02": "heavy" },
    });
  });

  // The shape real exports carry: an id per record, dates not in order, and
  // multi-select types holding a list of options. Values here are invented.
  it("reads a record list in the shape of a real export", () => {
    expect(
      parse([
        {
          type: "period",
          id: "4f0c1d2e-0000-4000-8000-000000000001",
          date: "2026-02-03",
          value: { option: "medium" },
        },
        {
          type: "period",
          id: "4f0c1d2e-0000-4000-8000-000000000002",
          date: "2026-02-01",
          value: { option: "light" },
        },
        {
          type: "tests",
          id: "4f0c1d2e-0000-4000-8000-000000000003",
          date: "2026-02-15",
          value: [{ option: "ovulation_positive" }],
        },
      ]),
    ).toEqual({
      source: "Clue",
      days: { "2026-02-01": "light", "2026-02-03": "medium" },
    });
  });

  it("does not read a period option of none as a bleeding day", () => {
    expect(
      parse([
        { date: "2026-03-01", type: "period", value: { option: "none" } },
        { date: "2026-03-02", type: "period", value: { option: "light" } },
        { date: "2026-03-02", type: "period", value: { option: "none" } },
      ]),
    ).toEqual({ source: "Clue", days: { "2026-03-02": "light" } });
    expect(parse({ data: [{ day: "2026-03-01", period: "none" }] })).toBeNull();
  });

  it("imports a spotting-only history", () => {
    expect(parse([{ date: "2026-03-06", type: "spotting" }])).toEqual({
      source: "Clue",
      days: { "2026-03-06": "spotting" },
    });
  });

  it("drops days after today, and returns null when only those are left", () => {
    expect(
      parse([
        { date: "2026-04-10", type: "period", value: { option: "light" } },
        { date: "2026-04-11", type: "period", value: { option: "light" } },
      ]),
    ).toEqual({ source: "Clue", days: { "2026-04-10": "light" } });
    expect(parse({ data: [{ day: "2026-05-01", period: "heavy" }] })).toBeNull();
  });
});

describe("parseOtherAppExport: legacy .cluedata", () => {
  it("reads the period field of each day and ignores the rest", () => {
    expect(
      parse({
        data: [
          { day: "2026-03-01", period: "heavy", pain: ["cramps"] },
          { day: "2026-03-02", period: "very_heavy" },
          { day: "2026-03-03", period: "spotting" },
          { day: "2026-03-04", mood: "happy" },
          { day: "2026-13-01", period: "light" },
          { day: "2026-03-05T08:00:00Z", period: "light" },
          { period: "light" },
        ],
      }),
    ).toEqual({
      source: "Clue",
      days: {
        "2026-03-01": "heavy",
        "2026-03-02": "heavy",
        "2026-03-03": "spotting",
        "2026-03-05": "light",
      },
    });
  });
});

describe("parseOtherAppExport: Flo", () => {
  const flo = (cycles: unknown[]) => parse({ operationalData: { cycles } });

  it("fills each cycle from start to end as plain logged days", () => {
    expect(
      flo([
        {
          period_start_date: "2026-03-01T00:00:00.000Z",
          period_end_date: "2026-03-03 23:59:59",
          other: 1,
        },
      ]),
    ).toEqual({
      source: "Flo",
      days: { "2026-03-01": null, "2026-03-02": null, "2026-03-03": null },
    });
  });

  it("reads each day's flow from period_intensity", () => {
    expect(
      flo([
        {
          period_start_date: "2026-03-01 22:00:00.0",
          period_end_date: "2026-03-04 22:00:00.0",
          period_intensity: '{"0": 3, "1": 1, "2": 2, "9": 3}',
        },
        {
          period_start_date: "2026-04-01 00:00:00.0",
          period_end_date: null,
          period_intensity: "not json",
        },
      ])?.days,
    ).toEqual({
      "2026-03-01": "heavy",
      "2026-03-02": "light",
      "2026-03-03": "medium",
      "2026-03-04": null,
      "2026-04-01": null,
    });
  });

  it("treats a missing, invalid or earlier end as a one-day period", () => {
    expect(
      flo([
        { period_start_date: "2026-01-01" },
        { period_start_date: "2026-02-01", period_end_date: "soon" },
        { period_start_date: "2026-03-05", period_end_date: "2026-03-01" },
      ])?.days,
    ).toEqual({ "2026-01-01": null, "2026-02-01": null, "2026-03-05": null });
  });

  it("clamps a runaway span to 15 days and an end to today", () => {
    const days = flo([
      { period_start_date: "2026-01-01", period_end_date: "2026-03-01" },
      { period_start_date: "2026-04-08", period_end_date: "2026-04-20" },
      { period_start_date: "2026-05-01", period_end_date: "2026-05-03" },
    ])?.days;
    expect(Object.keys(days ?? {}).sort()).toEqual([
      ...Array.from({ length: 15 }, (_, i) => `2026-01-${String(i + 1).padStart(2, "0")}`),
      "2026-04-08",
      "2026-04-09",
      "2026-04-10",
    ]);
  });

  it("skips a cycle that starts after today, even in the year 9999", () => {
    // Its day loop used to step past 9999-12-31, which has no IsoDate.
    expect(flo([{ period_start_date: "9999-12-31", period_end_date: "1970-01-01" }])).toBeNull();
  });

  it("merges overlapping cycles and skips invalid starts", () => {
    expect(
      flo([
        { period_start_date: "2026-03-01", period_end_date: "2026-03-02" },
        { period_start_date: "2026-03-02", period_end_date: "2026-03-03" },
        { period_start_date: "not a date" },
        { period_end_date: "2026-03-09" },
        null,
      ])?.days,
    ).toEqual({ "2026-03-01": null, "2026-03-02": null, "2026-03-03": null });
  });
});

describe("parseOtherAppExport: unrecognised input", () => {
  it.each([
    ["not JSON", "{"],
    ["a scalar", "42"],
    ["null", "null"],
    ["some other object", JSON.stringify({ hello: "world" })],
    ["an empty Clue export", "[]"],
    ["a Clue export with no bleeding", JSON.stringify([{ date: "2026-03-01", type: "pain" }])],
    ["a Flo export with no cycles", JSON.stringify({ operationalData: { cycles: [] } })],
    ["Flo with cycles not an array", JSON.stringify({ operationalData: { cycles: {} } })],
  ])("returns null for %s", (_, text) => {
    expect(parseOtherAppExport(text, TODAY)).toBeNull();
  });
});

describe("mergeImportedDays", () => {
  it("fills empty days and leaves days already logged in Tide untouched", () => {
    const state = createAppState({
      intensityByDay: { "2026-03-01": "light", "2026-03-02": "spotting" },
      settings: { theme: "dark" },
    });
    const merged = mergeImportedDays(state, {
      "2026-03-01": "heavy",
      "2026-03-02": null,
      "2026-03-03": "medium",
    });
    expect(merged).toEqual({
      ...state,
      intensityByDay: {
        "2026-03-01": "light",
        "2026-03-02": "spotting",
        "2026-03-03": "medium",
      },
    });
  });
});

describe("parseOtherAppExport properties", () => {
  // Date-ish strings: real days and timestamps in any four-digit year,
  // impossible days, and junk.
  const anyDate = fc.date({
    min: new Date("0000-01-01T00:00:00Z"),
    max: new Date("9999-12-31T23:59:59Z"),
    noInvalidDate: true,
  });
  const dateish = fc.oneof(
    anyDate.map((date) => date.toISOString()),
    anyDate.map((date) => date.toISOString().slice(0, 10)),
    fc.stringMatching(/^\d{4}-\d{2}-\d{2}/),
    fc.string(),
  );
  const loose = fc.oneof(dateish, fc.anything());
  const clueMeasurements = fc.array(
    fc.record(
      {
        date: loose,
        type: fc.oneof(fc.constantFrom("period", "spotting", "pain"), loose),
        value: fc.oneof(fc.record({ option: fc.oneof(fc.string(), fc.anything()) }), fc.anything()),
      },
      { requiredKeys: [] },
    ),
  );
  const clueLegacy = fc.record({
    data: fc.array(fc.record({ day: loose, period: fc.oneof(fc.string(), fc.anything()) })),
  });
  const flo = fc.record({
    operationalData: fc.record({
      cycles: fc.array(
        fc.oneof(
          fc.record(
            {
              period_start_date: loose,
              period_end_date: loose,
              period_intensity: fc.oneof(
                fc.dictionary(fc.nat(20).map(String), fc.integer()).map((levels) => JSON.stringify(levels)),
                fc.string(),
                fc.anything(),
              ),
            },
            { requiredKeys: [] },
          ),
          fc.anything(),
        ),
      ),
    }),
  });
  const text = fc.oneof(
    fc.string(),
    fc.jsonValue().map((value) => JSON.stringify(value)),
    fc.oneof(clueMeasurements, clueLegacy, flo).map((value) => JSON.stringify(value)),
  );

  it("never throws, and returns only real days up to today", () => {
    fc.assert(
      fc.property(text, (input) => {
        const result = parseOtherAppExport(input, TODAY);
        for (const day of Object.keys(result?.days ?? {})) {
          expect(isIsoDate(day) && day <= TODAY).toBe(true);
        }
      }),
    );
  });
});
