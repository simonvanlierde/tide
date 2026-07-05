import { useEffect, useEffectEvent, useState } from "react";
import { getReminderState, type ReminderState } from "../../domain/reminders";
import type { IsoDate } from "../../domain/types";
import {
  useAppState,
  useAppStateActions,
  useCycleSummary,
} from "../../state/provider";
import {
  REMINDER_STATUS_TIMEOUT_MS,
  REMINDER_WINDOW_OPTIONS,
  SNOOZE_OPTIONS,
} from "./config";

interface RemindersSectionProps {
  today: IsoDate;
}

export function RemindersSection({ today }: RemindersSectionProps) {
  const state = useAppState();
  const actions = useAppStateActions();
  const summary = useCycleSummary(today);
  const [statusMessage, setReminderStatus] = useState<string | null>(null);
  const clearStatus = useEffectEvent(() => setReminderStatus(null));

  useEffect(() => {
    if (statusMessage === null) {
      return;
    }

    const timeoutId = window.setTimeout(
      clearStatus,
      REMINDER_STATUS_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  const reminderState = getReminderState({
    today,
    nextPeriodDate: summary.nextPeriod.date,
    reminderWindowDays: state.settings.reminderWindowDays,
    snoozedUntil: state.settings.snoozedUntil,
  });
  const snoozeSummary = reminderState.isSnoozed
    ? `Snoozed until ${state.settings.snoozedUntil}.`
    : null;
  const reminderSummary = getReminderSummary(reminderState);

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
          <p className="supporting-note">{snoozeSummary ?? reminderSummary}</p>
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
          {statusMessage ? (
            <p
              className="status-chip status-chip--muted"
              role="status"
              aria-live="polite"
            >
              {statusMessage}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function getReminderSummary(reminderState: ReminderState) {
  if (reminderState.daysUntilReminder === null) {
    return "Next reminder will appear once your next cycle estimate is ready.";
  }

  if (reminderState.daysUntilReminder > 0) {
    const days = reminderState.daysUntilReminder;
    return `Next reminder in ${days} day${days === 1 ? "" : "s"}.`;
  }

  if (reminderState.isInReminderWindow) {
    return "Reminder window is active now.";
  }

  return "Reminder window has passed for this cycle.";
}
