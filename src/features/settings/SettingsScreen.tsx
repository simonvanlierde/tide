import { useState } from "react";
import type { HomeLayoutMode, IsoDate } from "../../domain/types";
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

const reminderWindowOptions = [3, 4, 5, 7] as const;
const snoozeOptions = [1, 3, 7] as const;
const layoutOptions: Array<{ value: HomeLayoutMode; label: string }> = [
  { value: "simple", label: "Simple info / chips" },
  { value: "linear", label: "Linear cycle" },
  { value: "circular", label: "Circular cycle" }
];

export function SettingsScreen({ today = getTodayIsoDate() }: SettingsScreenProps) {
  const {
    state,
    summary,
    exportState,
    importState,
    setReminderWindowDays,
    snoozeReminders,
    clearReminderSnooze,
    setHomeLayoutMode,
    setPhaseChipVisibility,
    setFertilityChipVisibility
  } = useAppState(today);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const snoozeSummary =
    state.settings.snoozedUntil &&
    differenceInDays(state.settings.snoozedUntil, today) >= 0
      ? `Snoozed until ${state.settings.snoozedUntil}.`
      : null;

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
        <h2 className="section-title">Reminder status</h2>
        <div className="settings-group">
          <h3 className="settings-subtitle">Reminder window</h3>
          <p>Reminder window: {state.settings.reminderWindowDays} days before the expected period.</p>
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
        </div>

        <div className="settings-group">
          <h3 className="settings-subtitle">Snooze status</h3>
          <p className="supporting-note">
            {snoozeSummary ?? "Reminders are currently active."}
          </p>
          <p className="supporting-note">
            Next reminder: {getReminderSummary(summary.nextPeriod.daysUntil, state.settings.reminderWindowDays)}
          </p>
        </div>

        <div className="settings-group">
          <h3 className="settings-subtitle">Quick snooze actions</h3>
          <div className="chip-row" role="group" aria-label="Quick snooze">
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
        </div>
      </article>

      <article className="utility-card">
        <h2 className="section-title">Backup</h2>
        <div className="settings-group">
          <h3 className="settings-subtitle">Home layout</h3>
          <div className="chip-row" role="group" aria-label="Home layout">
            {layoutOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={state.settings.homeLayoutMode === option.value ? "chip-button is-active" : "chip-button"}
                onClick={() => {
                  setHomeLayoutMode(option.value);
                  setStatusMessage(`Home layout set to ${option.label}`);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="settings-toggle-row">
            <button
              type="button"
              className={state.settings.showPhaseChip ? "chip-button is-active" : "chip-button"}
              onClick={() => {
                setPhaseChipVisibility(!state.settings.showPhaseChip);
                setStatusMessage(state.settings.showPhaseChip ? "Phase chip hidden" : "Phase chip shown");
              }}
            >
              {state.settings.showPhaseChip ? "Hide phase chip" : "Show phase chip"}
            </button>
            <button
              type="button"
              className={state.settings.showFertilityChip ? "chip-button is-active" : "chip-button"}
              onClick={() => {
                setFertilityChipVisibility(!state.settings.showFertilityChip);
                setStatusMessage(
                  state.settings.showFertilityChip ? "Fertility chip hidden" : "Fertility chip shown"
                );
              }}
            >
              {state.settings.showFertilityChip ? "Hide fertility chip" : "Show fertility chip"}
            </button>
          </div>
        </div>

        <div className="settings-group">
          <h3 className="settings-subtitle">Manual backup</h3>
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
        </div>
        {statusMessage ? <p className="supporting-note">{statusMessage}</p> : null}
      </article>

      <article className="utility-card">
        <h2 className="section-title">Install guide</h2>
        <p>Install Tide from Safari to use it like an app on iPhone.</p>
        <p className="supporting-note">Open Share, then choose Add to Home Screen.</p>
      </article>

      <article className="utility-card">
        <h2 className="section-title">Privacy notice</h2>
        <p>Your cycle data stays on this device unless you export it yourself.</p>
      </article>
    </section>
  );
}
