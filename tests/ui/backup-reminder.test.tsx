import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SCHEMA_VERSION, STORAGE_KEY } from "../../src/data/schema";
import { downloadAppState } from "../../src/data/transfer";
import { BackupReminder } from "../../src/features/reminders/BackupReminder";
import { useAppState } from "../../src/state/provider";
import { createAppState, renderWithAppState } from "../support/app";

vi.mock("../../src/data/transfer", () => ({ downloadAppState: vi.fn() }));

function StoredDates() {
  const { settings } = useAppState();
  return <output>{`${settings.lastBackupOn ?? "never"}/${settings.backupReminderDismissedOn ?? "never"}`}</output>;
}

function renderReminder() {
  const onDone = vi.fn();
  renderWithAppState(
    <>
      <BackupReminder today="2026-05-15" onDone={onDone} />
      <StoredDates />
    </>,
    { state: createAppState({ periodDays: ["2026-03-01"] }) },
  );
  return onDone;
}

describe("backup reminder", () => {
  it("offers backup for diary-only history", () => {
    renderWithAppState(<BackupReminder today="2026-05-15" onDone={vi.fn()} />, {
      state: createAppState({ detailsByDay: { "2026-03-01": { symptoms: ["fatigue"], mood: null, note: "" } } }),
    });
    expect(screen.getByRole("button", { name: "Back up data" })).toBeInTheDocument();
  });

  it("downloads before recording the date, then dismisses", () => {
    vi.mocked(downloadAppState).mockReset();
    const onDone = renderReminder();
    fireEvent.click(screen.getByRole("button", { name: "Back up data" }));
    expect(downloadAppState).toHaveBeenCalledTimes(1);
    expect(screen.getByText("2026-05-15/never")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Back up data" })).toBeNull();
    expect(onDone).toHaveBeenCalledOnce();
  });

  it("snoozes without downloading", () => {
    vi.mocked(downloadAppState).mockReset();
    const onDone = renderReminder();
    fireEvent.click(screen.getByRole("button", { name: "Remind me in a week" }));
    expect(downloadAppState).not.toHaveBeenCalled();
    expect(screen.getByText("never/2026-05-15")).toBeInTheDocument();
    expect(onDone).toHaveBeenCalledOnce();
  });

  it("keeps the reminder and its dates when downloading fails", () => {
    vi.mocked(downloadAppState)
      .mockReset()
      .mockImplementation(() => {
        throw new Error("download blocked");
      });
    const onDone = renderReminder();
    fireEvent.click(screen.getByRole("button", { name: "Back up data" }));
    expect(screen.getByRole("alert")).toHaveTextContent("The backup couldn't be downloaded. Try again.");
    expect(screen.getByText("never/never")).toBeInTheDocument();
    expect(onDone).not.toHaveBeenCalled();
  });

  it("stays hidden when a newer build owns the stored data", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...createAppState({ periodDays: ["2026-03-01"] }), schemaVersion: SCHEMA_VERSION + 1 }),
    );
    renderWithAppState(<BackupReminder today="2026-05-15" onDone={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Back up data" })).toBeNull();
  });
});
