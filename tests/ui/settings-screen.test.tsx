import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/app/App";
import { SCHEMA_VERSION } from "../../src/data/schema";
import {
  loadStoredState,
  STORAGE_KEY,
  saveAppState,
} from "../../src/data/storage";
import { getPeriodDays } from "../../src/domain/flow";
import { SettingsScreen } from "../../src/features/settings/SettingsScreen";
import { createAppState, renderWithAppState } from "../support/app";

function renderSettings(state = createAppState()) {
  renderWithAppState(<SettingsScreen />, { state });
}

describe("SettingsScreen", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  it("makes the privacy promise where the data controls are", () => {
    renderSettings();
    expect(
      screen.getByRole("heading", { level: 2, name: /about/i }),
    ).toBeInTheDocument();

    // The promise belongs beside export, import and delete — not adrift in About.
    const dataCard = screen
      .getByRole("heading", { level: 2, name: /^data$/i })
      .closest("article");
    expect(dataCard).not.toBeNull();
    expect(
      within(dataCard as HTMLElement).getByText(
        /your data never leaves this device/i,
      ),
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
      screen.getByText(/fertility estimates are for information only/i),
    ).toBeInTheDocument();
  });

  it("answers the fertility question from the switch and remembers it", async () => {
    const user = userEvent.setup();
    renderSettings();

    // Exact name: the info button beside the label is not part of it.
    const toggle = screen.getByRole("switch", {
      name: "Show fertility estimates",
    });
    // Not asked yet: estimates are hidden, so the switch reads off.
    expect(toggle).not.toBeChecked();

    await user.click(toggle);
    expect(loadStoredState().state.settings.showFertility).toBe(true);

    await user.click(toggle);
    expect(loadStoredState().state.settings.showFertility).toBe(false);
  });

  it("toggles cycle day numbers off and remembers the choice", async () => {
    const user = userEvent.setup();
    renderSettings();

    const toggle = screen.getByRole("switch", {
      name: /cycle day numbers/i,
    });
    expect(toggle).toBeChecked();

    await user.click(toggle);

    expect(loadStoredState().state.settings.showCycleDayNumbers).toBe(false);
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
    expect(loadStoredState().state.settings.theme).toBe("dark");
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
      schemaVersion: 2,
      days: { "2026-04-02": "medium" },
      settings: {
        showFertility: null,
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

  it("saves the next three expected periods as a calendar file", async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:tide-calendar");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    renderWithAppState(<SettingsScreen today="2026-04-18" />, {
      state: createAppState({ periodDays: ["2026-03-05", "2026-04-02"] }),
    });

    // Fertility estimates are off, so there is nothing to opt in to.
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /add to calendar/i }));
    // The file builder loads on first use.
    await waitFor(() => expect(createObjectURL).toHaveBeenCalledOnce());

    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    const ics = await blob.text();
    expect(blob.type).toBe("text/calendar");
    expect(ics.match(/^DTSTART;VALUE=DATE:\d+/gm)).toEqual([
      "DTSTART;VALUE=DATE:20260430",
      "DTSTART;VALUE=DATE:20260528",
      "DTSTART;VALUE=DATE:20260625",
    ]);
    expect(ics).not.toMatch(/fertile/i);
    expect(screen.getByRole("status")).toHaveTextContent(
      /calendar file saved/i,
    );
  });

  it("adds fertile windows to the calendar file only when ticked", async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:tide-calendar");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    renderWithAppState(<SettingsScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: ["2026-03-05", "2026-04-02"],
        settings: { showFertility: true },
      }),
    });

    const checkbox = screen.getByRole("checkbox", {
      name: /include fertile windows/i,
    });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    await user.click(screen.getByRole("button", { name: /add to calendar/i }));
    await waitFor(() => expect(createObjectURL).toHaveBeenCalledOnce());

    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    const ics = await blob.text();
    // The window before the 04-30 period ended on 04-17, before today.
    expect(ics.match(/^UID:fertile-[\d-]+/gm)).toEqual([
      "UID:fertile-2026-03-05-4",
      "UID:fertile-2026-03-05-5",
    ]);
  });

  it("offers no calendar file before there is a forecast", () => {
    renderSettings();

    expect(
      screen.queryByRole("button", { name: /add to calendar/i }),
    ).not.toBeInTheDocument();
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
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /isn.t a tide backup or a clue or flo export/i,
    );

    await user.upload(
      screen.getByLabelText(/import data file/i),
      new File([JSON.stringify(imported)], "tide.json", {
        type: "application/json",
      }),
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(getPeriodDays(loadStoredState().state.intensityByDay)).toEqual([
      "2026-04-02",
    ]);
    expect(loadStoredState().state.intensityByDay).toEqual({
      "2026-04-02": "heavy",
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      /imported 1 logged day\./i,
    );
  });

  it("asks before an import overwrites existing days, and says what it will cost", async () => {
    const user = userEvent.setup();
    const imported = createAppState({
      periodDays: ["2026-04-02", "2026-04-03"],
    });
    renderSettings(createAppState({ periodDays: ["2026-03-01"] }));

    const upload = () =>
      user.upload(
        screen.getByLabelText(/import data file/i),
        new File([JSON.stringify(imported)], "tide.json", {
          type: "application/json",
        }),
      );

    await upload();
    // Both sides of the trade are named before anything is replaced.
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(/this file holds 2 logged days/i),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/replaces the 1 day logged on this device/i),
    ).toBeInTheDocument();
    expect(getPeriodDays(loadStoredState().state.intensityByDay)).toEqual([
      "2026-03-01",
    ]);

    // Backing out keeps what's here.
    await user.click(within(dialog).getByRole("button", { name: /cancel/i }));
    expect(getPeriodDays(loadStoredState().state.intensityByDay)).toEqual([
      "2026-03-01",
    ]);

    await upload();
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: /^replace$/i,
      }),
    );
    expect(getPeriodDays(loadStoredState().state.intensityByDay)).toEqual([
      "2026-04-02",
      "2026-04-03",
    ]);
    expect(screen.getByRole("status")).toHaveTextContent(
      /imported 2 logged days\./i,
    );
  });

  it("adds the days from a Clue export after confirming, keeping days already logged", async () => {
    const user = userEvent.setup();
    renderSettings(
      createAppState({ intensityByDay: { "2026-03-02": "light" } }),
    );
    const clue = [
      { date: "2026-03-01", type: "period", value: { option: "heavy" } },
      { date: "2026-03-02", type: "period", value: { option: "very_heavy" } },
      { date: "2026-03-03", type: "spotting", value: {} },
      { date: "2026-03-03", type: "pain", value: { option: "cramps" } },
    ];
    await user.upload(
      screen.getByLabelText(/import data file/i),
      new File([JSON.stringify(clue)], "measurements.json", {
        type: "application/json",
      }),
    );

    // Nothing is written until the user agrees.
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: /add days from clue/i }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/this file holds 3 logged days/i),
    ).toBeInTheDocument();
    expect(loadStoredState().state.intensityByDay).toEqual({
      "2026-03-02": "light",
    });

    await user.click(within(dialog).getByRole("button", { name: /^add$/i }));
    expect(loadStoredState().state.intensityByDay).toEqual({
      "2026-03-01": "heavy",
      "2026-03-02": "light",
      "2026-03-03": "spotting",
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      /imported 2 logged days\./i,
    );
  });

  it("drops Clue days after the day the screen renders for", async () => {
    const user = userEvent.setup();
    renderWithAppState(<SettingsScreen today="2026-03-02" />, {
      state: createAppState(),
    });
    const clue = [
      { date: "2026-03-01", type: "period", value: { option: "heavy" } },
      { date: "2026-03-02", type: "period", value: {} },
      { date: "2026-03-03", type: "period", value: {} },
    ];
    await user.upload(
      screen.getByLabelText(/import data file/i),
      new File([JSON.stringify(clue)], "measurements.json", {
        type: "application/json",
      }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(/this file holds 2 logged days/i),
    ).toBeInTheDocument();
  });

  it("keeps a day another tab saved while the Clue dialog was open", async () => {
    const user = userEvent.setup();
    renderSettings(createAppState({ periodDays: ["2026-03-02"] }));
    const clue = [{ date: "2026-03-01", type: "period", value: {} }];
    await user.upload(
      screen.getByLabelText(/import data file/i),
      new File([JSON.stringify(clue)], "measurements.json", {
        type: "application/json",
      }),
    );
    const dialog = await screen.findByRole("dialog");

    saveAppState(createAppState({ periodDays: ["2026-03-02", "2026-03-10"] }));
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    });
    await user.click(within(dialog).getByRole("button", { name: /^add$/i }));

    expect(getPeriodDays(loadStoredState().state.intensityByDay)).toEqual([
      "2026-03-01",
      "2026-03-02",
      "2026-03-10",
    ]);
    expect(screen.getByRole("status")).toHaveTextContent(
      /imported 1 logged day\./i,
    );
  });

  it("shows the import error when the file cannot be read", async () => {
    const user = userEvent.setup();
    renderSettings();
    const file = new File(["{}"], "tide.json", { type: "application/json" });
    vi.spyOn(file, "text").mockRejectedValue(new Error("unreadable"));
    await user.upload(screen.getByLabelText(/import data file/i), file);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /tide backup or a clue or flo export/i,
    );
  });
  it("names the supported sources when a JSON file is from none of them", async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.upload(
      screen.getByLabelText(/import data file/i),
      new File([JSON.stringify({ hello: "world" })], "other.json", {
        type: "application/json",
      }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /tide backup or a clue or flo export/i,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("asks before deleting everything, and only then deletes", async () => {
    const user = userEvent.setup();
    renderSettings(createAppState({ periodDays: ["2026-03-01"] }));

    await user.click(screen.getByRole("button", { name: /delete all data/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(getPeriodDays(loadStoredState().state.intensityByDay)).toEqual([
      "2026-03-01",
    ]);

    await user.click(screen.getByRole("button", { name: /delete all data/i }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: /^delete$/i,
      }),
    );
    expect(getPeriodDays(loadStoredState().state.intensityByDay)).toEqual([]);
  });

  it("confirms an export instead of letting the download happen in silence", async () => {
    const user = userEvent.setup();
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:tide-backup");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      () => undefined,
    );
    renderSettings(createAppState({ periodDays: ["2026-03-01"] }));

    await user.click(screen.getByRole("button", { name: /export/i }));

    expect(screen.getByRole("status")).toHaveTextContent(/backup saved/i);
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

  it("blocks import and delete while a newer build owns the stored data", () => {
    const raw = JSON.stringify({
      schemaVersion: SCHEMA_VERSION + 1,
      intensityByDay: { "2026-04-02": "heavy" },
    });
    window.localStorage.setItem(STORAGE_KEY, raw);
    window.history.replaceState(null, "", "/settings");
    renderWithAppState(<App />);

    // The app-level notice is the only one; the buttons point at it.
    expect(
      screen.getAllByText(/a newer version of tide saved your data/i),
    ).toHaveLength(1);

    for (const name of [/^import$/i, /delete all data/i]) {
      const button = screen.getByRole("button", { name });
      expect(button).toBeDisabled();
      expect(button).toHaveAccessibleDescription(
        /a newer version of tide saved your data/i,
      );
    }
    // Export only reads, so it stays available.
    expect(screen.getByRole("button", { name: /^export$/i })).toBeEnabled();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(raw);
  });
});
