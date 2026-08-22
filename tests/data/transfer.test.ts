import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultAppState } from "../../src/data/schema";
import { downloadAppState, parseImportedState } from "../../src/data/transfer";
import { createAppState } from "../support/app";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("parseImportedState", () => {
  it("imports the compact date -> flow backup format, deriving the period days from its keys", () => {
    const parsed = parseImportedState(
      JSON.stringify({
        days: { "2026-04-02": "heavy", "2026-04-03": "medium" },
        settings: { showFertility: false, theme: "dark" },
      }),
    );

    expect(parsed).toEqual(
      createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
        intensityByDay: { "2026-04-02": "heavy", "2026-04-03": "medium" },
        settings: { showFertility: false, theme: "dark" },
      }),
    );
  });

  it("round-trips a state through export and back, dropping only transient dismiss state", () => {
    const state = createAppState({
      periodDays: ["2026-04-02", "2026-04-03"],
      intensityByDay: { "2026-04-02": "heavy" },
      settings: {
        dismissedOn: "2026-04-02",
        showFertility: false,
        language: "de",
      },
    });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:tide-backup");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    downloadAppState(state);
    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;

    return blob.text().then((text) => {
      // dismissedOn is transient UI state and must not leave in the backup.
      expect(text).not.toContain("dismissedOn");
      expect(parseImportedState(text)).toEqual({
        ...state,
        // Export writes an explicit flow for every logged day, so a logged-but-
        // unrated day comes back as an explicit default rather than an absent key.
        intensityByDay: { "2026-04-02": "heavy", "2026-04-03": "medium" },
        settings: { ...state.settings, dismissedOn: null },
      });
      expect(click).toHaveBeenCalledOnce();
    });
  });

  it("throws on non-JSON so the caller can warn the user", () => {
    expect(() => parseImportedState("not json")).toThrow();
  });

  it("drops malformed fields instead of corrupting state", () => {
    const parsed = parseImportedState(
      JSON.stringify({
        days: { nope: "heavy", "2026-04-02": 5 },
        settings: "bad",
      }),
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
    expect(await blob.text()).toBe(
      JSON.stringify(
        {
          days: { "2026-04-02": "medium" },
          settings: {
            showFertility: true,
            showCycleDayNumbers: true,
            theme: "system",
            language: "system",
          },
        },
        null,
        2,
      ),
    );
    expect(blob.type).toBe("application/json");
    expect(click).toHaveBeenCalledOnce();
    expect(click.mock.contexts[0]).toMatchObject({
      href: "blob:tide-backup",
      download: "tide-backup.json",
    });
    // Revocation is deferred a tick so the download has started first.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:tide-backup");
  });
});
