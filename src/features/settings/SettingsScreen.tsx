import { useState } from "react";
import type { IsoDate } from "../../domain/types";
import { useAppState } from "../../hooks/useAppState";
import { differenceInDays, getTodayIsoDate } from "../../utils/date";

function getReminderSummary(daysUntilPeriod: number | null, reminderWindowDays: number) {
  if (daysUntilPeriod === null) {
    return "Next reminder will appear once your next cycle estimate is ready.";
  }

  const daysUntilReminder = daysUntilPeriod - reminderWindowDays;

  if (daysUntilReminder > 0) {
    return `Next reminder in ${daysUntilReminder} days.`;
  }

  if (daysUntilPeriod >= -1) {
    return "Reminder window is active now.";
  }

  return "Reminder window has passed for this cycle.";
}

interface SettingsScreenProps {
  today?: IsoDate;
}

export function SettingsScreen({ today = getTodayIsoDate() }: SettingsScreenProps) {
  const { state, summary, exportState, importState, setReminderWindowDays, snoozeReminders, clearReminderSnooze } = useAppState(today);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const reminderWindowOptions = [3, 4, 5, 7];
  const snoozeOptions = [1, 3, 7] as const;
  const snoozeSummary =
    state.settings.snoozedUntil &&
    differenceInDays(state.settings.snoozedUntil, today) >= 0
      ? `Snoozed until ${state.settings.snoozedUntil}.`
      : null;

  const reminderActionsLabel = snoozeSummary ? "Adjust snooze" : "Quick snooze";

  function handleExport() {
    const backup = exportState();
    const blob = new Blob([backup], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "tide-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage("Backup exported");
  }

  return (
    <section className="utility-screen">
      <h1 className="utility-screen__title">Settings</h1>

      <article className="utility-card">
        <h2 className="section-title">Privacy</h2>
        <p>Your cycle data stays on this device unless you export it yourself.</p>
      </article>

      <article className="utility-card">
        <h2 className="section-title">Reminders</h2>
        <p>Reminder window: {state.settings.reminderWindowDays} days before the expected period.</p>
        <p className="supporting-note">
          Next reminder: {getReminderSummary(summary.nextPeriod.daysUntil, state.settings.reminderWindowDays)}
        </p>
        {snoozeSummary ? <p className="supporting-note">{snoozeSummary}</p> : null}
        <div className="chip-row" role="group" aria-label={reminderActionsLabel}>
          {snoozeOptions.map((days) => (
            <button
              key={days}
              type="button"
              className="chip-button"
              onClick={() => {
                snoozeReminders(days);
                setStatusMessage(`Reminders snoozed for ${days} day${days === 1 ? "" : "s"}`);
              }}
            >
              Snooze {days} {days === 1 ? "day" : "days"}
            </button>
          ))}
        </div>
        {snoozeSummary ? (
          <button
            type="button"
            className="text-action"
            onClick={() => {
              clearReminderSnooze();
              setStatusMessage("Reminders turned back on");
            }}
          >
            Turn reminders back on now
          </button>
        ) : null}
        <div className="chip-row" role="group" aria-label="Reminder window">
          {reminderWindowOptions.map((days) => (
            <button
              key={days}
              type="button"
              className={days === state.settings.reminderWindowDays ? "chip-button is-active" : "chip-button"}
              onClick={() => {
                setReminderWindowDays(days);
                setStatusMessage(`Reminder window set to ${days} days`);
              }}
            >
              {days} days
            </button>
          ))}
        </div>
      </article>

      <article className="utility-card">
        <h2 className="section-title">Install</h2>
        <p>Install Tide from Safari to use it like an app on iPhone.</p>
        <p className="supporting-note">Open Share, then choose Add to Home Screen.</p>
      </article>

      <article className="utility-card">
        <h2 className="section-title">Backup</h2>
        <button className="primary-action" onClick={handleExport}>
          Export backup
        </button>
        <label className="file-input">
          <span>Import backup file</span>
          <input
            type="file"
            aria-label="Import backup file"
            accept="application/json"
            onChange={async (event) => {
              const file = event.target.files?.[0];

              if (!file) {
                return;
              }

              try {
                await importState(file);
                setStatusMessage("Backup imported");
              } catch (error) {
                setStatusMessage(
                  error instanceof Error ? error.message : "Import failed"
                );
              }
            }}
          />
        </label>
        {statusMessage ? <p className="supporting-note">{statusMessage}</p> : null}
      </article>
    </section>
  );
}
