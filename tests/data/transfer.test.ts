import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultAppState } from "../../src/data/schema";
import { downloadAppState, parseImportedState } from "../../src/data/transfer";
import { createAppState } from "../support/app";

afterEach(() => {
  vi.restoreAllMocks();
});

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

describe("downloadAppState", () => {
  it("downloads a formatted JSON backup and revokes its blob URL", async () => {
    const state = createAppState({ periodDays: ["2026-04-02"] });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:tide-backup");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});

    downloadAppState(state);

    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    expect(await blob.text()).toBe(JSON.stringify(state, null, 2));
    expect(blob.type).toBe("application/json");
    expect(click).toHaveBeenCalledOnce();
    expect(click.mock.contexts[0]).toMatchObject({
      href: "blob:tide-backup",
      download: "tide-backup.json",
    });
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:tide-backup");
  });
});
