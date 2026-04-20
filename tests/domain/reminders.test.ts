import { describe, expect, it } from "vitest";
import { getReminderState } from "../../src/domain/reminders";

describe("getReminderState", () => {
  it("enables reminders during the expected period window", () => {
    const state = getReminderState({
      today: "2026-04-28",
      nextPeriodDate: "2026-04-30",
      reminderWindowDays: 4,
      snoozedUntil: null,
    });

    expect(state.shouldNudge).toBe(true);
    expect(state.isInReminderWindow).toBe(true);
  });

  it("suppresses reminders while snoozed", () => {
    const state = getReminderState({
      today: "2026-04-28",
      nextPeriodDate: "2026-04-30",
      reminderWindowDays: 4,
      snoozedUntil: "2026-05-01",
    });

    expect(state.shouldNudge).toBe(false);
  });

  it("hides reminder relevance outside the reminder window", () => {
    const state = getReminderState({
      today: "2026-04-10",
      nextPeriodDate: "2026-04-30",
      reminderWindowDays: 4,
      snoozedUntil: null,
    });

    expect(state.shouldNudge).toBe(false);
  });

  it("keeps reminders active on the expected start day and one day late", () => {
    const dueDay = getReminderState({
      today: "2026-04-30",
      nextPeriodDate: "2026-04-30",
      reminderWindowDays: 4,
      snoozedUntil: null,
    });
    const oneDayLate = getReminderState({
      today: "2026-05-01",
      nextPeriodDate: "2026-04-30",
      reminderWindowDays: 4,
      snoozedUntil: null,
    });
    const twoDaysLate = getReminderState({
      today: "2026-05-02",
      nextPeriodDate: "2026-04-30",
      reminderWindowDays: 4,
      snoozedUntil: null,
    });

    expect(dueDay.shouldNudge).toBe(true);
    expect(oneDayLate.shouldNudge).toBe(true);
    expect(twoDaysLate.shouldNudge).toBe(false);
  });
});
