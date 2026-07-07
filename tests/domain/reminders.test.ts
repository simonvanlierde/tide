import { describe, expect, it } from "vitest";
import { getReminderState } from "../../src/domain/reminders";

const BASE = {
  today: "2026-04-28",
  nextPeriodDate: "2026-04-30",
  isTodayLogged: false,
  dismissedOn: null,
} as const;

describe("getReminderState", () => {
  it("prompts within the two-day window before the expected period", () => {
    const state = getReminderState(BASE);

    expect(state.shouldPrompt).toBe(true);
    expect(state.isExpectedSoon).toBe(true);
    expect(state.isOverdue).toBe(false);
    expect(state.expectedDate).toBe("2026-04-30");
  });

  it("stays 'expected soon' even when dismissed or logged", () => {
    const dismissed = getReminderState({ ...BASE, dismissedOn: "2026-04-28" });
    const logged = getReminderState({ ...BASE, isTodayLogged: true });

    expect(dismissed.shouldPrompt).toBe(false);
    expect(dismissed.isExpectedSoon).toBe(true);
    expect(logged.shouldPrompt).toBe(false);
    expect(logged.isExpectedSoon).toBe(true);
  });

  it("stays silent outside the window", () => {
    const state = getReminderState({ ...BASE, today: "2026-04-27" });

    expect(state.shouldPrompt).toBe(false);
  });

  it("keeps prompting once overdue and flags it", () => {
    const state = getReminderState({ ...BASE, today: "2026-05-05" });

    expect(state.shouldPrompt).toBe(true);
    expect(state.isOverdue).toBe(true);
  });

  it("stops prompting once the prediction is long overdue (abandoned)", () => {
    // 15 days past the expected date, nothing logged: the estimate is stale, so
    // it must stop nagging instead of prompting every day forever.
    const state = getReminderState({ ...BASE, today: "2026-05-15" });

    expect(state.isExpectedSoon).toBe(false);
    expect(state.shouldPrompt).toBe(false);
  });

  it("stops prompting once today is logged", () => {
    const state = getReminderState({ ...BASE, isTodayLogged: true });

    expect(state.shouldPrompt).toBe(false);
  });

  it("hides the prompt for the day it was dismissed", () => {
    const dismissedToday = getReminderState({
      ...BASE,
      dismissedOn: "2026-04-28",
    });
    const dismissedEarlier = getReminderState({
      ...BASE,
      dismissedOn: "2026-04-27",
    });

    expect(dismissedToday.shouldPrompt).toBe(false);
    expect(dismissedEarlier.shouldPrompt).toBe(true);
  });

  it("does nothing without a prediction", () => {
    const state = getReminderState({ ...BASE, nextPeriodDate: null });

    expect(state.shouldPrompt).toBe(false);
    expect(state.expectedDate).toBeNull();
  });
});
