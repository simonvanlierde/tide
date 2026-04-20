import { useEffect, useEffectEvent, useState } from "react";
import type { IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions, useCycleSummary } from "../../state";
import { StatusMessage } from "../../ui/StatusMessage";
import { differenceInDays, getTodayIsoDate } from "../../utils/date";
import {
  HOME_DISPLAY_MODE_OPTIONS,
  INFORMATION_COPY,
  REMINDER_STATUS_TIMEOUT_MS,
  REMINDER_WINDOW_OPTIONS,
  SNOOZE_OPTIONS,
} from "./config";

interface SettingsScreenProps {
  today?: IsoDate;
}

interface SettingsStatusMessage {
  scope: "reminders";
  text: string;
}

function useReminderStatusMessage(timeoutMs: number) {
  const [statusMessage, setStatusMessage] =
    useState<SettingsStatusMessage | null>(null);
  const clearReminderMessage = useEffectEvent(() => {
    setStatusMessage((current) =>
      current?.scope === "reminders" ? null : current,
    );
  });

  useEffect(() => {
    if (statusMessage?.scope !== "reminders") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearReminderMessage();
    }, timeoutMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [statusMessage, timeoutMs]);

  return {
    statusMessage,
    setStatusMessage,
  };
}

export function SettingsScreen({
  today = getTodayIsoDate(),
}: SettingsScreenProps) {
  const state = useAppState();
  const actions = useAppStateActions();
  const summary = useCycleSummary(today);
  const { statusMessage, setStatusMessage } = useReminderStatusMessage(
    REMINDER_STATUS_TIMEOUT_MS,
  );
  const snoozeSummary =
    state.settings.snoozedUntil &&
    differenceInDays(state.settings.snoozedUntil, today) >= 0
      ? `Snoozed until ${state.settings.snoozedUntil}.`
      : null;
  const reminderSummary = getReminderSummary(
    summary.nextPeriod.daysUntil,
    state.settings.reminderWindowDays,
  );

  function setReminderStatus(text: string) {
    setStatusMessage({
      scope: "reminders",
      text,
    });
  }

  function handleHomeDisplayModeChange(
    mode: typeof state.settings.homeDisplayMode,
  ) {
    actions.setHomeDisplayMode(mode);
  }

  function handleReminderWindowChange(days: number) {
    actions.setReminderWindowDays(days);
    setReminderStatus(`Reminder window set to ${days} days`);
  }

  function handleReminderSnooze(days: number) {
    actions.snoozeReminders(today, days);
    setReminderStatus(`Snoozed for ${days} day${days === 1 ? "" : "s"}`);
  }

  function handleClearReminderSnooze() {
    actions.clearReminderSnooze();
    setReminderStatus("Reminders turned back on");
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
                onClick={() => handleHomeDisplayModeChange(mode.value)}
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
                  onClick={() => handleReminderWindowChange(days)}
                >
                  {days} days
                </button>
              ))}
            </fieldset>
          </div>

          <div className="settings-row settings-row--accent">
            <p className="supporting-note">
              {snoozeSummary ?? "Active."} Next reminder: {reminderSummary}
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
                  onClick={() => handleReminderSnooze(days)}
                >
                  Snooze {days} {days === 1 ? "day" : "days"}
                </button>
              ))}
            </fieldset>
            {snoozeSummary ? (
              <button
                type="button"
                className="text-action"
                onClick={handleClearReminderSnooze}
              >
                Turn reminders back on
              </button>
            ) : null}
            {statusMessage?.scope === "reminders" ? (
              <StatusMessage>{statusMessage.text}</StatusMessage>
            ) : null}
          </div>
        </div>
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

function getReminderSummary(
  daysUntilPeriod: number | null,
  reminderWindowDays: number,
) {
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
