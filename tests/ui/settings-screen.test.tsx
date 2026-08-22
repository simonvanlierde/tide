import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadAppState } from "../../src/data/storage";
import { getPeriodDays } from "../../src/domain/flow";
import { SettingsScreen } from "../../src/features/settings/SettingsScreen";
import { createAppState, renderWithAppState } from "../support/app";

function renderSettings(state = createAppState()) {
  renderWithAppState(<SettingsScreen />, { state });
}

describe("SettingsScreen", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the privacy notice inside the About card", () => {
    renderSettings();
    expect(
      screen.getByRole("heading", { level: 2, name: /about/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/your data never leaves this device/i),
    ).toBeInTheDocument();
  });

  it("links to the source repository from the About card", () => {
    renderSettings();

    const link = screen.getByRole("link", { name: /source code/i });
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/simonvanlierde/tide",
    );
  });

  it("no longer surfaces reminder or snooze controls", () => {
    renderSettings();

    expect(
      screen.queryByRole("heading", { name: /reminders/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: /reminder window/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /snooze/i }),
    ).not.toBeInTheDocument();
  });

  it("shows concise information guidance", () => {
    renderSettings();

    expect(
      screen.getByText(/fertility estimates are informational/i),
    ).toBeInTheDocument();
  });

  it("toggles fertility estimates off and remembers the choice", async () => {
    const user = userEvent.setup();
    renderSettings();

    const toggle = screen.getByRole("switch", { name: /fertility estimates/i });
    expect(toggle).toBeChecked();

    await user.click(toggle);

    expect(loadAppState().settings.showFertility).toBe(false);
  });

  it("toggles cycle day numbers off and remembers the choice", async () => {
    const user = userEvent.setup();
    renderSettings();

    const toggle = screen.getByRole("switch", {
      name: /cycle day numbers/i,
    });
    expect(toggle).toBeChecked();

    await user.click(toggle);

    expect(loadAppState().settings.showCycleDayNumbers).toBe(false);
  });

  it("switches the theme and remembers the choice", async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(
      within(screen.getByRole("group", { name: /^theme$/i })).getByRole(
        "button",
        { name: /^dark$/i },
      ),
    );

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(loadAppState().settings.theme).toBe("dark");
  });

  it("exports the current state as a Tide backup", async () => {
    const user = userEvent.setup();
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
    renderSettings(state);

    await user.click(screen.getByRole("button", { name: /^export$/i }));

    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    expect(JSON.parse(await blob.text())).toEqual({
      days: { "2026-04-02": "medium" },
      settings: {
        showFertility: true,
        showCycleDayNumbers: true,
        theme: "system",
        language: "system",
      },
    });
    expect(blob.type).toBe("application/json");
    expect(click).toHaveBeenCalledOnce();
    expect(click.mock.contexts[0]).toMatchObject({
      href: "blob:tide-backup",
      download: expect.stringMatching(/^tide-backup-\d{4}-\d{2}-\d{2}\.json$/),
    });
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:tide-backup");
  });

  it("imports a valid Tide backup and clears any previous import error", async () => {
    const user = userEvent.setup();
    const imported = createAppState({
      periodDays: ["2026-04-02"],
      intensityByDay: { "2026-04-02": "heavy" },
    });
    renderSettings();

    await user.upload(
      screen.getByLabelText(/import data file/i),
      new File(["not json"], "broken.json", { type: "application/json" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/valid tide backup/i);

    await user.upload(
      screen.getByLabelText(/import data file/i),
      new File([JSON.stringify(imported)], "tide.json", {
        type: "application/json",
      }),
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(getPeriodDays(loadAppState().intensityByDay)).toEqual([
      "2026-04-02",
    ]);
    expect(loadAppState().intensityByDay).toEqual({ "2026-04-02": "heavy" });
    expect(screen.getByRole("status")).toHaveTextContent(
      /imported 1 logged day\./i,
    );
  });

  it("opens the hidden file picker from the import action", async () => {
    const user = userEvent.setup();
    const click = vi
      .spyOn(HTMLInputElement.prototype, "click")
      .mockImplementation(() => {});
    renderSettings();

    await user.click(screen.getByRole("button", { name: /^import$/i }));

    expect(click).toHaveBeenCalledOnce();
  });

  it("ignores an import change without a selected file", () => {
    renderSettings();

    fireEvent.change(screen.getByLabelText(/import data file/i), {
      target: { files: [] },
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
