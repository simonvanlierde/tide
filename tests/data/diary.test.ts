import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultAppState, normalizeAppState, SCHEMA_VERSION } from "../../src/data/schema";
import { loadStoredState, STORAGE_KEY, saveAppState } from "../../src/data/storage";
import { downloadAppState, mergeImportedDays, parseImportedState } from "../../src/data/transfer";

const day = "2026-04-02";
const details = { symptoms: ["cramps", "cramps"], mood: "good", note: "A quiet day" };

afterEach(() => vi.restoreAllMocks());

describe("daily details persistence", () => {
  it("migrates schema 3 without diary entries and writes the current schema", () => {
    const state = normalizeAppState({ schemaVersion: 3, intensityByDay: {} });
    expect(state.detailsByDay).toEqual({});
    saveAppState(state);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "").schemaVersion).toBe(SCHEMA_VERSION);
  });

  it("keeps missing symptoms distinct from explicit no symptoms and deduplicates presets", () => {
    const state = normalizeAppState({
      detailsByDay: {
        [day]: details,
        "2026-04-03": { symptoms: null, mood: "low", note: "" },
        "2026-04-04": { symptoms: [], mood: null, note: "" },
        "2026-04-05": { symptoms: null, mood: null, note: "" },
      },
    });
    expect(state.detailsByDay).toEqual({
      [day]: { ...details, symptoms: ["cramps"] },
      "2026-04-03": { symptoms: null, mood: "low", note: "" },
      "2026-04-04": { symptoms: [], mood: null, note: "" },
    });
    saveAppState(state);
    expect(loadStoredState().state).toEqual(state);
  });

  it("drops malformed stored details without touching valid records", () => {
    for (const invalid of [
      [],
      null,
      { ...details, symptoms: ["unknown"] },
      { ...details, mood: "great" },
      { ...details, note: "x".repeat(1001) },
    ]) {
      expect(
        normalizeAppState({ detailsByDay: { [day]: invalid, "2026-04-03": details, nope: details } }).detailsByDay,
      ).toEqual({
        "2026-04-03": { ...details, symptoms: ["cramps"] },
      });
    }
    expect(normalizeAppState({ detailsByDay: [] }).detailsByDay).toEqual({});
  });

  it("round-trips diary-only history in backups and filters future details", async () => {
    const state = normalizeAppState({
      detailsByDay: { [day]: details, "2026-04-04": { symptoms: [], mood: null, note: "" } },
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const create = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:backup");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    downloadAppState(state);
    const blob = create.mock.calls[0]?.[0] as Blob;
    const text = await blob.text();
    expect(parseImportedState(text, "2026-04-05")).toEqual(state);
    expect(parseImportedState(text, day).detailsByDay).toEqual({ [day]: { ...details, symptoms: ["cramps"] } });
    expect(mergeImportedDays(state, { [day]: "heavy" }).detailsByDay).toEqual(state.detailsByDay);
  });

  it("refuses malformed diary backups instead of silently dropping notes", () => {
    for (const detailsByDay of [
      [],
      null,
      { [day]: { ...details, note: "x".repeat(1001) } },
      { [day]: { ...details, symptoms: ["unknown"] } },
      { nope: details },
    ]) {
      expect(() => parseImportedState(JSON.stringify({ days: {}, detailsByDay }))).toThrow();
    }
    expect(parseImportedState(JSON.stringify({ days: {} }))).toEqual({
      ...defaultAppState,
      settings: { ...defaultAppState.settings, onboardingDismissed: true, calendarHelpDismissed: true },
    });
  });
});
