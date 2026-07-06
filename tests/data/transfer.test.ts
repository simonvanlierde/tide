import { describe, expect, it } from "vitest";
import { defaultAppState } from "../../src/data/schema";
import { parseImportedState } from "../../src/data/transfer";
import { createAppState } from "../support/app";

describe("parseImportedState", () => {
  it("round-trips an exported state", () => {
    const state = createAppState({
      periodDays: ["2026-04-02"],
      intensityByDay: { "2026-04-02": "heavy" },
    });

    expect(parseImportedState(JSON.stringify(state))).toEqual(state);
  });

  it("throws on non-JSON so the caller can warn the user", () => {
    expect(() => parseImportedState("not json")).toThrow();
  });

  it("drops malformed fields instead of corrupting state", () => {
    const parsed = parseImportedState(
      JSON.stringify({ periodDays: ["nope", 5], settings: "bad" }),
    );

    expect(parsed).toEqual(defaultAppState);
  });
});
