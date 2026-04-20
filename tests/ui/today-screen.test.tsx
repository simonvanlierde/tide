import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TodayScreen } from "../../src/features/today/TodayScreen";
import { createAppState } from "../support/appState";
import { renderWithAppState } from "./renderWithAppState";

const defaultState = createAppState({
  periodDays: ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"],
});

describe("TodayScreen", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the summary home with the core cycle cards", () => {
    renderWithAppState(<TodayScreen today="2026-04-18" />, {
      state: defaultState,
    });

    expect(
      screen.getByRole("heading", { name: /day 17/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/currently in the luteal phase/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/period expected in 12 days/i)).toBeInTheDocument();
    expect(screen.getByText(/^luteal$/i)).toBeInTheDocument();
    expect(screen.getByText(/lower chance today/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/show fertility disclaimer/i),
    ).toBeInTheDocument();
  });

  it("renders the linear cycle view when selected", () => {
    renderWithAppState(<TodayScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: defaultState.periodDays,
        settings: {
          ...defaultState.settings,
          homeDisplayMode: "linear",
        },
      }),
    });

    expect(screen.getByLabelText(/linear cycle view/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/cycle summary/i)).not.toBeInTheDocument();
  });

  it("renders the circular cycle view when selected", () => {
    renderWithAppState(<TodayScreen today="2026-04-18" />, {
      state: createAppState({
        periodDays: defaultState.periodDays,
        settings: {
          ...defaultState.settings,
          homeDisplayMode: "circular",
        },
      }),
    });

    expect(screen.getByLabelText(/circular cycle view/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/cycle summary/i)).not.toBeInTheDocument();
  });

  it("shows plain-language ovulation guidance", () => {
    renderWithAppState(<TodayScreen today="2026-04-15" />, {
      state: defaultState,
    });

    expect(
      screen.getByText(/ovulation is likely around now/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/higher chance today/i)).toBeInTheDocument();
  });

  it("shows the fertility disclaimer in an info popover", () => {
    renderWithAppState(<TodayScreen today="2026-04-18" />, {
      state: defaultState,
    });

    fireEvent.click(screen.getByLabelText(/show fertility disclaimer/i));

    expect(
      screen.getByText(/informational only and not birth control/i),
    ).toBeInTheDocument();
  });

  it("logs a bleeding day from the primary action", () => {
    renderWithAppState(<TodayScreen today="2026-04-18" />, {
      state: defaultState,
    });

    fireEvent.click(
      screen.getByRole("button", { name: /log bleeding today/i }),
    );
    expect(
      screen.getByRole("button", { name: /remove bleeding log/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/bleeding logged for today/i)).toBeInTheDocument();
  });

  it("shows a learning-state note when fallback predictions are in use", () => {
    renderWithAppState(<TodayScreen today="2026-04-21" />, {
      state: createAppState({
        periodDays: ["2026-04-19", "2026-04-20"],
      }),
    });

    expect(
      screen.getByText(/learning from recent logs/i),
    ).toBeInTheDocument();
  });

  it("shows a calm late label instead of a negative next-period number", () => {
    renderWithAppState(<TodayScreen today="2026-05-01" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
      }),
    });

    expect(screen.getByText(/period expected 1 day ago/i)).toBeInTheDocument();
    expect(screen.queryByText(/-1 day/i)).not.toBeInTheDocument();
  });

  it("hides the snooze action when reminders are not currently relevant", () => {
    renderWithAppState(<TodayScreen today="2026-04-21" />, {
      state: createAppState({
        periodDays: ["2026-04-19", "2026-04-20"],
      }),
    });

    expect(
      screen.queryByRole("button", { name: /snooze reminders/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the snooze action on the predicted start day and one day late", () => {
    renderWithAppState(<TodayScreen today="2026-04-30" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
      }),
    });

    expect(
      screen.getByRole("button", { name: /snooze 1 day/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /snooze 3 days/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /snooze 5 days/i }),
    ).toBeInTheDocument();
  });

  it("shows reminder state copy in the today flow", () => {
    renderWithAppState(<TodayScreen today="2026-04-28" />, {
      state: createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
      }),
    });

    expect(screen.getByText(/reminder active/i)).toBeInTheDocument();
  });
});
