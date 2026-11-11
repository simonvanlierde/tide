import { describe, expect, it } from "vitest";
import { shouldRemindBackup } from "../../src/domain/backup";

const history = {
  today: "2026-05-15" as const,
  loggedDays: ["2026-03-16" as const],
  lastBackupOn: null,
  dismissedOn: null,
};

describe("backup reminder", () => {
  it("waits until 60 days of history before the first reminder", () => {
    expect(shouldRemindBackup({ ...history, today: "2026-05-14" })).toBe(false);
    expect(shouldRemindBackup(history)).toBe(true);
  });

  it("waits 60 days after a backup", () => {
    expect(shouldRemindBackup({ ...history, lastBackupOn: "2026-03-17" })).toBe(false);
    expect(shouldRemindBackup({ ...history, lastBackupOn: "2026-03-16" })).toBe(true);
  });

  it("snoozes for seven days", () => {
    expect(shouldRemindBackup({ ...history, dismissedOn: "2026-05-09" })).toBe(false);
    expect(shouldRemindBackup({ ...history, dismissedOn: "2026-05-08" })).toBe(true);
  });

  it("ignores future logs and empty history", () => {
    expect(shouldRemindBackup({ ...history, loggedDays: [] })).toBe(false);
    expect(shouldRemindBackup({ ...history, loggedDays: ["2026-06-01"] })).toBe(false);
    expect(shouldRemindBackup({ ...history, loggedDays: ["2026-06-01", "2026-03-16"] })).toBe(true);
  });

  it("counts a backup or snooze made today", () => {
    expect(shouldRemindBackup({ ...history, lastBackupOn: "2026-05-15" })).toBe(false);
    expect(shouldRemindBackup({ ...history, dismissedOn: "2026-05-15" })).toBe(false);
  });

  it("ignores backup and snooze dates after today, as after a clock moves back", () => {
    expect(shouldRemindBackup({ ...history, lastBackupOn: "2026-05-16" })).toBe(true);
    expect(shouldRemindBackup({ ...history, dismissedOn: "2026-05-16" })).toBe(true);
    expect(shouldRemindBackup({ ...history, lastBackupOn: "2026-06-01", dismissedOn: "2026-06-01" })).toBe(true);
  });
});
