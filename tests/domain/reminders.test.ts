import { describe, expect, it } from "vitest";
import { getReminderState } from "../../src/domain/reminders";

describe("getReminderState", () => {
  it("enables reminders during the expected period window", () => {
    const state = getReminderState({
      today: "2026-04-28",
      nextPeriodDate: "2026-04-30",
      reminderWindowDays: 4,
      snoozedUntil: null,
      notificationPermission: "granted"
    });

    expect(state.shouldNudge).toBe(true);
    expect(state.mode).toBe("notification");
  });

  it("suppresses reminders while snoozed", () => {
    const state = getReminderState({
      today: "2026-04-28",
      nextPeriodDate: "2026-04-30",
      reminderWindowDays: 4,
      snoozedUntil: "2026-05-01",
      notificationPermission: "granted"
    });

    expect(state.shouldNudge).toBe(false);
  });
});
