import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { loadAppState } from "../../src/data/storage";
import { SettingsScreen } from "../../src/features/settings/SettingsScreen";
import { createAppState, renderWithAppState } from "../support/app";

function renderSettings(state = createAppState()) {
  renderWithAppState(<SettingsScreen />, { state });
}

describe("SettingsScreen", () => {
  it("shows the privacy notice inside the About card", () => {
    renderSettings();
    expect(
      screen.getByRole("heading", { level: 2, name: /about/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/everything stays on this device/i),
    ).toBeInTheDocument();
  });

  it("links to the source repository from the About card", () => {
    renderSettings();

    const link = screen.getByRole("link", { name: /source on github/i });
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
      screen.getByText(/log a day when you had menstrual bleeding/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/informational only and not birth control/i),
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

  it("toggles period day numbers off and remembers the choice", async () => {
    const user = userEvent.setup();
    renderSettings();

    const toggle = screen.getByRole("switch", {
      name: /period day numbers/i,
    });
    expect(toggle).toBeChecked();

    await user.click(toggle);

    expect(loadAppState().settings.showPeriodDayNumbers).toBe(false);
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
});
