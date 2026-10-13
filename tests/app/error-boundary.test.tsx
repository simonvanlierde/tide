import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "../../src/app/ErrorBoundary";
import { STORAGE_KEY } from "../../src/data/schema";

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
  it("downloads the stored blob exactly as saved", async () => {
    // Not valid app state on purpose: the download must not parse it.
    const raw = '{"intensityByDay":{"2026-04-02":"heavy"},"future":[1]}';
    window.localStorage.setItem(STORAGE_KEY, raw);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:tide-raw");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    renderCrash();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /download raw data/i }));

    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    expect(await blob.text()).toBe(raw);
  });

  it("offers no download when nothing is stored", () => {
    renderCrash();

    expect(screen.getByRole("button", { name: /reload/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /download raw data/i }),
    ).not.toBeInTheDocument();
  });

  it("speaks the stored language", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ settings: { language: "de" } }),
    );

    renderCrash();

    expect(screen.getByRole("alert")).toHaveAttribute("lang", "de");
    expect(
      screen.getByRole("button", { name: "Rohdaten herunterladen" }),
    ).toBeInTheDocument();
  });
});
