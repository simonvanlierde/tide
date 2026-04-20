import { LogAction } from "../log/LogAction";

interface TodayReminderActionsProps {
  isTodayLogged: boolean;
  shouldShowSnoozeActions: boolean;
  snoozeOptions: readonly number[];
  onToggleToday: () => void;
  onSnooze: (days: number) => void;
}

export function TodayReminderActions({
  isTodayLogged,
  shouldShowSnoozeActions,
  snoozeOptions,
  onToggleToday,
  onSnooze,
}: TodayReminderActionsProps) {
  return (
    <>
      <LogAction isLogged={isTodayLogged} onToggle={onToggleToday} />
      {shouldShowSnoozeActions ? (
        <fieldset className="snooze-actions chip-fieldset">
          <legend className="settings-label">Snooze reminders</legend>
          {snoozeOptions.map((days) => (
            <button
              key={days}
              type="button"
              className="secondary-action secondary-action--chip"
              onClick={() => onSnooze(days)}
            >
              Snooze {days} {days === 1 ? "day" : "days"}
            </button>
          ))}
        </fieldset>
      ) : null}
    </>
  );
}
