import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "../../src/app/ErrorBoundary";
import { STORAGE_KEY } from "../../src/data/schema";
import { BACKUP_KEY } from "../../src/data/storage";
import { AppStateProvider } from "../../src/state/provider";

const damagedState = JSON.stringify({
  schemaVersion: 4,
  intensityByDay: { "2026-04-02": "heavy" },
  detailsByDay: { "2026-04-02": { symptoms: ["fatigue"], mood: "good", note: "x".repeat(2000) } },
  settings: {},
});

function renderStoredApp() {
  return render(
    <ErrorBoundary>
      <AppStateProvider>
        <p>App loaded</p>
      </AppStateProvider>
    </ErrorBoundary>,
  );
}

function failBackupWrites() {
  const setItem = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === BACKUP_KEY) throw new DOMException("Storage is full", "QuotaExceededError");
    setItem.call(this, key, value);
  });
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
}

function Crash(): never {
  throw new Error("render failed");
}

function renderCrash() {
  // React logs the caught error; keep the test output readable.
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(
    <ErrorBoundary>
      <Crash />
    </ErrorBoundary>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it.each([damagedState, "{ not json"])(
    "preserves raw data when a recovery backup cannot be saved (%#)",
    async (raw) => {
      window.localStorage.setItem(STORAGE_KEY, raw);
      failBackupWrites();
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
      const download = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:tide-raw");
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

      renderStoredApp();

      expect(window.localStorage.getItem(STORAGE_KEY)).toBe(raw);
      expect(window.localStorage.getItem(BACKUP_KEY)).toBeNull();
      await userEvent.setup().click(screen.getByRole("button", { name: /download raw data/i }));
      const blob = download.mock.calls[0]?.[0] as Blob;
      expect(await blob.text()).toBe(raw);
    },
  );

  it("preserves a changed record from another tab when its recovery backup fails", () => {
    renderStoredApp();
    failBackupWrites();
    window.localStorage.setItem(STORAGE_KEY, damagedState);

    act(() => window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY })));

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(damagedState);
    expect(screen.getByRole("button", { name: /download raw data/i })).toBeInTheDocument();
  });

  it("loads normalized data when the original can be backed up", () => {
    window.localStorage.setItem(STORAGE_KEY, damagedState);

    renderStoredApp();

    expect(screen.getByText("App loaded")).toBeInTheDocument();
    expect(window.localStorage.getItem(BACKUP_KEY)).toBe(damagedState);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "").intensityByDay).toEqual({
      "2026-04-02": "heavy",
    });
  });

  it("downloads the stored blob exactly as saved", async () => {
    // Not valid app state on purpose: the download must not parse it.
    const raw = '{"intensityByDay":{"2026-04-02":"heavy"},"future":[1]}';
    window.localStorage.setItem(STORAGE_KEY, raw);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:tide-raw");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    renderCrash();
    await userEvent.setup().click(screen.getByRole("button", { name: /download raw data/i }));

    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    expect(await blob.text()).toBe(raw);
  });

  it("offers no download when nothing is stored", () => {
    renderCrash();

    expect(screen.getByRole("button", { name: /reload/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /download raw data/i })).not.toBeInTheDocument();
  });

  it("speaks the stored language", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings: { language: "de" } }));

    renderCrash();

    expect(screen.getByRole("alert")).toHaveAttribute("lang", "de");
    expect(screen.getByRole("button", { name: "Rohdaten herunterladen" })).toBeInTheDocument();
  });
});
