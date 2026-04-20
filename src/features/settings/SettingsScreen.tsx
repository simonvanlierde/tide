import { useEffect, useState } from "react";
import type { IsoDate } from "../../domain/types";
import { useAppState } from "../../state/appState";
import { AppIcon, Download, Upload } from "../../ui/icons";
import { differenceInDays, getTodayIsoDate } from "../../utils/date";
import {
  HOME_DISPLAY_MODE_OPTIONS,
  INFORMATION_COPY,
  REMINDER_WINDOW_OPTIONS,
  REMINDER_STATUS_TIMEOUT_MS,
  SNOOZE_OPTIONS,
} from "./config";
import { getReminderSummary } from "./viewModel";

interface SettingsScreenProps {
  today?: IsoDate;
}

interface StatusMessage {
  scope: "reminders" | "data";
  text: string;
}

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
    snoozeReminders,
    clearReminderSnooze,
  } = useAppState(today);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null,
  );
  const snoozeSummary =
    state.settings.snoozedUntil &&
    differenceInDays(state.settings.snoozedUntil, today) >= 0
      ? `Snoozed until ${state.settings.snoozedUntil}.`
      : null;

  useEffect(() => {
    if (statusMessage?.scope !== "reminders") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStatusMessage((current) =>
        current?.scope === "reminders" ? null : current,
      );
    }, REMINDER_STATUS_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [statusMessage]);

  function handleExport() {
    const backup = exportState();
    const blob = new Blob([backup], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "tide-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ scope: "data", text: "Backup exported" });
  }

  return (
    <section className="utility-screen">
      <article className="utility-card">
        <h2 className="section-title">Home</h2>
        <div className="settings-group settings-group--compact">
          <fieldset
            className="chip-row chip-row--dense chip-fieldset"
            aria-label="Home display mode"
          >
            {HOME_DISPLAY_MODE_OPTIONS.map((mode) => (
              <button
                key={mode.value}
                type="button"
                className={
                  state.settings.homeDisplayMode === mode.value
                    ? "chip-button is-active"
                    : "chip-button"
                }
                aria-pressed={state.settings.homeDisplayMode === mode.value}
                onClick={() => {
                  setHomeDisplayMode(mode.value);
                }}
              >
                {mode.label}
              </button>
            ))}
          </fieldset>
          <p className="supporting-note">
            Compare summary, linear, and circular views.
          </p>
        </div>
      </article>

      <article className="utility-card">
        <h2 className="section-title">Reminders</h2>
        <div className="settings-group settings-group--compact">
          <div className="settings-row">
            <p className="settings-value">
              {state.settings.reminderWindowDays} days before your expected
              period.
            </p>
            <fieldset
              className="chip-row chip-row--dense chip-fieldset"
              aria-label="Reminder window"
            >
              {REMINDER_WINDOW_OPTIONS.map((days) => (
                <button
                  key={days}
                  type="button"
                  className={
                    days === state.settings.reminderWindowDays
                      ? "chip-button is-active"
                      : "chip-button"
                  }
                  aria-pressed={days === state.settings.reminderWindowDays}
                  onClick={() => {
                    setReminderWindowDays(days);
                    setStatusMessage({
                      scope: "reminders",
                      text: `Reminder window set to ${days} days`,
                    });
                  }}
                >
                  {days} days
                </button>
              ))}
            </fieldset>
          </div>

          <div className="settings-row settings-row--accent">
            <p className="supporting-note">
              {snoozeSummary ?? "Active."} Next reminder:{" "}
              {getReminderSummary(
                summary.nextPeriod.daysUntil,
                state.settings.reminderWindowDays,
              )}
            </p>
            <fieldset
              className="chip-row chip-row--dense chip-fieldset"
              aria-label="Snooze reminders"
            >
              {SNOOZE_OPTIONS.map((days) => (
                <button
                  key={days}
                  type="button"
                  className="chip-button"
                  onClick={() => {
                    snoozeReminders(days);
                    setStatusMessage({
                      scope: "reminders",
                      text: `Snoozed for ${days} day${days === 1 ? "" : "s"}`,
                    });
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
                  setStatusMessage({
                    scope: "reminders",
                    text: "Reminders turned back on",
                  });
                }}
              >
                Turn reminders back on
              </button>
            ) : null}
            {statusMessage?.scope === "reminders" ? (
              <p
                className="status-chip status-chip--muted"
                role="status"
                aria-live="polite"
              >
                {statusMessage.text}
              </p>
            ) : null}
          </div>
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
                  setStatusMessage({ scope: "data", text: "Backup imported" });
                } catch (error) {
                  setStatusMessage({
                    scope: "data",
                    text:
                      error instanceof Error ? error.message : "Import failed",
                  });
                }
              }}
            />
          </label>
        </div>
        {statusMessage?.scope === "data" ? (
          <p className="status-chip status-chip--muted">{statusMessage.text}</p>
        ) : null}
      </article>

      <article className="utility-card">
        <h2 className="section-title">Information</h2>
        <div className="settings-group settings-group--compact">
          <p>{INFORMATION_COPY.logging}</p>
          <p className="supporting-note">{INFORMATION_COPY.fertility}</p>
          <p className="supporting-note">{INFORMATION_COPY.privacy}</p>
        </div>
      </article>
    </section>
  );
}
