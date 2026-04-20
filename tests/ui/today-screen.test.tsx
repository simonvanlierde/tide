import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { AppSettings, AppState } from "../../src/domain/types";
import { TodayScreen } from "../../src/features/today/TodayScreen";
import { AppStateProvider } from "../../src/state/appState";
import { renderWithAppState } from "./renderWithAppState";

const defaultSettings: AppSettings = {
  reminderWindowDays: 4,
  snoozedUntil: null,
  homeDisplayMode: "summary",
  homeCards: {
    showNextPeriodCard: true,
    showPhaseCard: true,
    showFertilityCard: true,
  },
};

const defaultState: AppState = {
  periodDays: ["2026-03-05", "2026-03-06", "2026-04-02", "2026-04-03"],
  settings: defaultSettings,
};

describe("TodayScreen", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the summary home without a duplicate today eyebrow", () => {
    renderWithAppState(<TodayScreen today="2026-04-18" />, {
      state: defaultState,
    });

    expect(
      screen.getByRole("heading", { name: /day 17/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^today$/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/currently in the luteal phase/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/period expected in 12 days/i)).toBeInTheDocument();
    expect(
      screen.getByText(/fertility estimate: lower chance today/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/informational only and not birth control/i),
    ).toBeInTheDocument();
  });

  it("respects the summary card visibility preferences", () => {
    renderWithAppState(<TodayScreen today="2026-04-18" />, {
      state: {
        periodDays: defaultState.periodDays,
        settings: {
          ...defaultSettings,
          homeCards: {
            showNextPeriodCard: false,
            showPhaseCard: true,
            showFertilityCard: false,
          },
        },
      },
    });

    expect(screen.queryByText(/next period/i)).not.toBeInTheDocument();
    expect(screen.getByText(/current phase/i)).toBeInTheDocument();
    expect(screen.queryByText(/fertility estimate:/i)).not.toBeInTheDocument();
  });

  it("renders the linear cycle view when selected", () => {
    renderWithAppState(<TodayScreen today="2026-04-18" />, {
      state: {
        periodDays: defaultState.periodDays,
        settings: {
          ...defaultSettings,
          homeDisplayMode: "linear",
        },
      },
    });

    expect(screen.getByLabelText(/linear cycle view/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/circular cycle view/i),
    ).not.toBeInTheDocument();
  });

  it("renders the circular cycle view when selected", () => {
    renderWithAppState(<TodayScreen today="2026-04-18" />, {
      state: {
        periodDays: defaultState.periodDays,
        settings: {
          ...defaultSettings,
          homeDisplayMode: "circular",
        },
      },
    });

    expect(screen.getByLabelText(/circular cycle view/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/linear cycle view/i),
    ).not.toBeInTheDocument();
  });

  it("shows plain-language ovulation guidance", () => {
    renderWithAppState(<TodayScreen today="2026-04-15" />, {
      state: defaultState,
    });

    expect(
      screen.getByText(/ovulation is likely around now/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/fertility estimate: higher chance today/i),
    ).toBeInTheDocument();
  });

  it("logs a bleeding day from the primary action", () => {
    const { container } = renderWithAppState(
      <TodayScreen today="2026-04-18" />,
      {
        state: defaultState,
      },
    );

    expect(
      container.querySelector(
        ".log-action .primary-action svg.lucide-droplets",
      ),
    ).not.toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: /log bleeding today/i }),
    );
    expect(
      screen.getByRole("button", { name: /remove bleeding log/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/marked as a bleeding day/i)).toBeInTheDocument();
    expect(
      container.querySelector(
        ".log-action .supporting-note svg.lucide-badge-check",
      ),
    ).not.toBeNull();
  });

  it("shows a learning-state note when fallback predictions are in use", () => {
    renderWithAppState(<TodayScreen today="2026-04-21" />, {
      state: {
        periodDays: ["2026-04-19", "2026-04-20"],
        settings: defaultSettings,
      },
    });

    expect(
      screen.getByText(/still learning your cycle from recent logs/i),
    ).toBeInTheDocument();
  });

  it("shows a calm late label instead of a negative next-period number", () => {
    renderWithAppState(<TodayScreen today="2026-05-01" />, {
      state: {
        periodDays: ["2026-04-02", "2026-04-03"],
        settings: defaultSettings,
      },
    });

    expect(screen.getByText(/period expected 1 day ago/i)).toBeInTheDocument();
    expect(screen.queryByText(/-1 day/i)).not.toBeInTheDocument();
  });

  it("hides the snooze action when reminders are not currently relevant", () => {
    renderWithAppState(<TodayScreen today="2026-04-21" />, {
      state: {
        periodDays: ["2026-04-19", "2026-04-20"],
        settings: defaultSettings,
      },
    });

    expect(
      screen.queryByRole("button", { name: /snooze reminders/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the snooze action on the predicted start day and one day late", () => {
    const { rerender } = renderWithAppState(
      <TodayScreen today="2026-04-30" />,
      {
        state: {
          periodDays: ["2026-04-02", "2026-04-03"],
          settings: defaultSettings,
        },
      },
    );

    expect(
      screen.getByRole("button", { name: /snooze 1 day/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /snooze 3 days/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /snooze 7 days/i }),
    ).toBeInTheDocument();

    rerender(
      <AppStateProvider>
        <TodayScreen today="2026-05-01" />
      </AppStateProvider>,
    );
    expect(
      screen.getByRole("button", { name: /snooze 3 days/i }),
    ).toBeInTheDocument();
  });

  it("shows shared reminder status icons in the today flow", () => {
    const { container, unmount } = renderWithAppState(
      <TodayScreen today="2026-04-30" />,
      {
        state: {
          periodDays: ["2026-04-02", "2026-04-03"],
          settings: defaultSettings,
        },
      },
    );

    expect(screen.getByText(/period reminder active/i)).toBeInTheDocument();
    expect(
      container.querySelector(".supporting-note svg.lucide-bell-ring"),
    ).not.toBeNull();

    unmount();
    const snoozedRender = renderWithAppState(
      <TodayScreen today="2026-04-30" />,
      {
        state: {
          periodDays: ["2026-04-02", "2026-04-03"],
          settings: { ...defaultSettings, snoozedUntil: "2026-05-03" },
        },
      },
    );

    expect(
      screen.getByText(/reminders snoozed until 2026-05-03/i),
    ).toBeInTheDocument();
    expect(
      snoozedRender.container.querySelector(
        ".supporting-note svg.lucide-bell-off",
      ),
    ).not.toBeNull();
  });
});
