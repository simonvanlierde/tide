import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { IsoDate } from "../../src/domain/types";
import { TodayScreen } from "../../src/features/today/TodayScreen";
import {
  createAppState,
  createLearnedCycleState,
  createLearningCycleState,
  renderWithAppState,
} from "../support/app";

function renderToday(today: IsoDate, state = createLearnedCycleState()) {
  renderWithAppState(<TodayScreen today={today} />, { state });
}

describe("TodayScreen", () => {
  it("renders the cycle dial with the core cycle facts", () => {
    renderToday("2026-04-18");

    expect(
      screen.getByRole("heading", { name: /day 17/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/cycle overview/i)).toBeInTheDocument();
    expect(
      screen.getByText(/currently in the luteal phase/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/^in 12 days$/i)).toBeInTheDocument();
    expect(screen.getByText(/^luteal$/i)).toBeInTheDocument();
    expect(screen.getByText(/lower chance today/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/show fertility disclaimer/i),
    ).toBeInTheDocument();
  });

  it("shows plain-language ovulation guidance", () => {
    renderToday("2026-04-15");

    expect(
      screen.getByText(/ovulation is likely around now/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/higher chance today/i)).toBeInTheDocument();
  });

  it("shows the fertility disclaimer in an info popover", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-18");

    await user.click(screen.getByLabelText(/show fertility disclaimer/i));

    expect(
      screen.getByText(/informational only and not birth control/i),
    ).toBeInTheDocument();
  });

  it("logs a bleeding day from the primary action", async () => {
    const user = userEvent.setup();
    renderToday("2026-04-18");

    await user.click(
      screen.getByRole("button", { name: /log bleeding today/i }),
    );
    expect(
      screen.getByRole("button", { name: /remove bleeding log/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/bleeding logged for today/i)).toBeInTheDocument();
  });

  it("shows a learning-state note when fallback predictions are in use", () => {
    renderToday("2026-04-21", createLearningCycleState());

    expect(screen.getByText(/learning from recent logs/i)).toBeInTheDocument();
  });

  it("shows a calm late label and reminder state around the prediction window", () => {
    renderToday(
      "2026-05-01",
      createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
      }),
    );

    expect(screen.getByText(/^1 day ago$/i)).toBeInTheDocument();
    expect(screen.queryByText(/-1 day/i)).not.toBeInTheDocument();
    expect(screen.getByText(/^next period$/i)).toBeInTheDocument();
    expect(screen.queryByText(/overdue|late/i)).not.toBeInTheDocument();
  });

  it("treats an expired snooze as inactive instead of showing it forever", () => {
    renderToday(
      "2026-04-30",
      createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
        settings: { snoozedUntil: "2026-04-20" },
      }),
    );

    expect(screen.queryByText(/snoozed until/i)).not.toBeInTheDocument();
    expect(screen.getByText(/reminder active/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /snooze 1 day/i }),
    ).toBeInTheDocument();
  });

  it("shows the snoozed note while a snooze is active", () => {
    renderToday(
      "2026-04-30",
      createAppState({
        periodDays: ["2026-04-02", "2026-04-03"],
        settings: { snoozedUntil: "2026-05-02" },
      }),
    );

    expect(screen.getByText(/snoozed until 2026-05-02/i)).toBeInTheDocument();
    expect(screen.queryByText(/reminder active/i)).not.toBeInTheDocument();
  });

  it("shows reminder actions only while the reminder window is active", () => {
    renderToday("2026-04-21", createLearningCycleState());

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
