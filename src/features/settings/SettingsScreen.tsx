import { useState } from "react";
import type { IsoDate } from "../../domain/types";
import { useAppState } from "../../state/appState";
import { differenceInDays, getTodayIsoDate } from "../../utils/date";
import { AppIcon, Download, Upload } from "../../ui/icons";
import { getReminderSummary } from "./viewModel";

interface SettingsScreenProps {
  today?: IsoDate;
}

const reminderWindowOptions = [3, 4, 5, 7] as const;
const snoozeOptions = [1, 3, 7] as const;

export function SettingsScreen({
  today = getTodayIsoDate(),
}: SettingsScreenProps) {
  const {
    state,
    summary,
    exportState,
    importState,
    setReminderWindowDays,
    setHomeDisplayMode,
    setHomeCardVisibility,
    snoozeReminders,
    clearReminderSnooze,
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
      <article className="utility-card">
        <h2 className="section-title">Home</h2>
        <div className="settings-group settings-group--compact">
          <div className="settings-row">
            <span className="settings-label">Display</span>
            <fieldset className="chip-row chip-row--dense chip-fieldset">
              <legend className="settings-label">Home display mode</legend>
              {(["summary", "linear", "circular"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={
                    state.settings.homeDisplayMode === mode
                      ? "chip-button is-active"
                      : "chip-button"
                  }
                  onClick={() => {
                    setHomeDisplayMode(mode);
                    setStatusMessage(`Home display set to ${mode}`);
                  }}
                >
                  {mode[0].toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </fieldset>
          </div>

          <fieldset className="settings-toggle-list">
            <legend className="settings-label">Home cards</legend>
            {(
              [
                ["showNextPeriodCard", "Next period"],
                ["showPhaseCard", "Phase"],
                ["showFertilityCard", "Fertility"],
              ] as const
            ).map(([key, label]) => {
              const isVisible = state.settings.homeCards[key];

              return (
                <button
                  key={key}
                  type="button"
                  className="settings-toggle"
                  aria-pressed={isVisible}
                  onClick={() => setHomeCardVisibility(key, !isVisible)}
                >
                  <span>{label}</span>
                  <span
                    className={
                      isVisible
                        ? "settings-toggle__switch is-on"
                        : "settings-toggle__switch"
                    }
                  >
                    <span className="settings-toggle__thumb" />
                  </span>
                </button>
              );
            })}
          </fieldset>
        </div>
      </article>

      <article className="utility-card">
        <h2 className="section-title">Reminders</h2>
        <div className="settings-group settings-group--compact">
          <p>
            Window: {state.settings.reminderWindowDays} days before the expected
            period.
          </p>
          <fieldset className="chip-row chip-row--dense chip-fieldset">
            <legend className="settings-label">Reminder window</legend>
            {reminderWindowOptions.map((days) => (
              <button
                key={days}
                type="button"
                className={
                  days === state.settings.reminderWindowDays
                    ? "chip-button is-active"
                    : "chip-button"
                }
                onClick={() => {
                  setReminderWindowDays(days);
                  setStatusMessage(`Reminder window set to ${days} days`);
                }}
              >
                {days} days
              </button>
            ))}
          </fieldset>
          <p className="supporting-note">
            {snoozeSummary ?? "Active."} Next reminder:{" "}
            {getReminderSummary(
              summary.nextPeriod.daysUntil,
              state.settings.reminderWindowDays,
            )}
          </p>
          <fieldset className="chip-row chip-row--dense chip-fieldset">
            <legend className="settings-label">Quick snooze</legend>
            {snoozeOptions.map((days) => (
              <button
                key={days}
                type="button"
                className="chip-button"
                onClick={() => {
                  snoozeReminders(days);
                  setStatusMessage(
                    `Reminders snoozed for ${days} day${days === 1 ? "" : "s"}`,
                  );
                }}
              >
                Snooze {days} {days === 1 ? "day" : "days"}
              </button>
            ))}
          </fieldset>
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
        <h2 className="section-title">Data</h2>
        <div className="settings-group settings-group--compact">
          <button
            type="button"
            className="primary-action"
            onClick={handleExport}
          >
            <span className="button-label">
              <AppIcon icon={Download} className="button-icon" />
              <span>Export backup</span>
            </span>
          </button>
          <label className="file-input">
            <span className="button-label">
              <AppIcon icon={Upload} className="button-icon" />
              <span>Import backup file</span>
            </span>
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
                    error instanceof Error ? error.message : "Import failed",
                  );
                }
              }}
            />
          </label>
        </div>
        {statusMessage ? (
          <p className="supporting-note">{statusMessage}</p>
        ) : null}
      </article>

      <article className="utility-card">
        <h2 className="section-title">Privacy</h2>
        <p>Logged bleeding day means menstrual bleeding on that date.</p>
        <p className="supporting-note">
          Spotting stays separate and does not start a new cycle.
        </p>
        <p className="supporting-note">
          Fertility estimates are informational only.
        </p>
        <p className="supporting-note">
          Data stays on this device unless you export it.
        </p>
      </article>
    </section>
  );
}
