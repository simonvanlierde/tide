import { describe, expect, it } from "vitest";
import { defaultAppState, normalizeAppState } from "../../src/data/schema";

describe("schema normalization at the storage trust boundary", () => {
  it("returns default state when the persisted blob is not an object", () => {
    expect(normalizeAppState("garbage")).toEqual(defaultAppState);
    expect(normalizeAppState(null)).toEqual(defaultAppState);
  });
});
