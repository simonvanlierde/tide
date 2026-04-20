import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { IsoDate } from "../../src/domain/types";
import { TodayScreen } from "../../src/features/today/TodayScreen";
import {
  createAppState,
  createLearnedCycleState,
  createLearningCycleState,
  renderWithAppState,
} from "../support/app";

function renderToday(
  today: IsoDate,
  state = createLearnedCycleState(),
) {
  renderWithAppState(<TodayScreen today={today} />, { state });
}

describe("TodayScreen", () => {
  it("renders the summary home with the core cycle cards", () => {
    renderToday("2026-04-18");

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
    renderToday(
      "2026-04-18",
      createAppState({
        periodDays: createLearnedCycleState().periodDays,
        settings: {
          ...createLearnedCycleState().settings,
          homeDisplayMode: "linear",
        },
      }),
    );

    expect(screen.getByLabelText(/linear cycle view/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/cycle summary/i)).not.toBeInTheDocument();
  });

  it("renders the circular cycle view when selected", () => {
    renderToday(
      "2026-04-18",
      createAppState({
        periodDays: createLearnedCycleState().periodDays,
        settings: {
          ...createLearnedCycleState().settings,
          homeDisplayMode: "circular",
        },
      }),
    );

    expect(screen.getByLabelText(/circular cycle view/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/cycle summary/i)).not.toBeInTheDocument();
  });

  it("shows plain-language ovulation guidance", () => {
    renderToday("2026-04-15");

    expect(
      screen.getByText(/ovulation is likely around now/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/higher chance today/i)).toBeInTheDocument();
  });

  it("shows the fertility disclaimer in an info popover", () => {
    renderToday("2026-04-18");

    fireEvent.click(screen.getByLabelText(/show fertility disclaimer/i));

    expect(
      screen.getByText(/informational only and not birth control/i),
    ).toBeInTheDocument();
  });

  it("logs a bleeding day from the primary action", () => {
    renderToday("2026-04-18");

    fireEvent.click(
      screen.getByRole("button", { name: /log bleeding today/i }),
    );
    expect(
      screen.getByRole("button", { name: /remove bleeding log/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/bleeding logged for today/i)).toBeInTheDocument();
  });

  it("shows a learning-state note when fallback predictions are in use", () => {
    renderToday("2026-04-21", createLearningCycleState());

    expect(
      screen.getByText(/learning from recent logs/i),
    ).toBeInTheDocument();
  });

  it("shows a calm late label and reminder state around the prediction window", () => {
    renderToday(
      "2026-05-01",
      createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
      }),
    );

    expect(screen.getByText(/period expected 1 day ago/i)).toBeInTheDocument();
    expect(screen.queryByText(/-1 day/i)).not.toBeInTheDocument();
    expect(screen.getByText(/window has passed for this cycle|reminder muted|period expected/i)).toBeInTheDocument();
  });

  it("shows reminder actions only while the reminder window is active", () => {
    renderToday(
      "2026-04-21",
      createLearningCycleState(),
    );

    expect(
      screen.queryByRole("button", { name: /snooze 1 day/i }),
    ).not.toBeInTheDocument();

    renderToday(
      "2026-04-30",
      createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
      }),
    );

    expect(
      screen.getByRole("button", { name: /snooze 1 day/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /snooze 3 days/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /snooze 5 days/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/reminder active/i)).toBeInTheDocument();
  });
});
