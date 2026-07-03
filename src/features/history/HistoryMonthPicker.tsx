import type { RefObject } from "react";

export interface HistoryMonthPickerProps {
  isPickerOpen: boolean;
  monthInputValue: `${number}-${number}`;
  monthInputRef: RefObject<HTMLInputElement | null>;
  onNativeMonthChange: (value: string) => void;
}

export function HistoryMonthPicker({
  isPickerOpen,
  monthInputValue,
  monthInputRef,
  onNativeMonthChange,
}: HistoryMonthPickerProps) {
  if (!isPickerOpen) {
    return null;
  }

  return (
    <div
      id="history-month-picker"
      className="calendar-picker-panel history-calendar__picker"
    >
      <label className="calendar-picker-field">
        <span className="settings-label history-calendar__picker-label">
          Jump to month
        </span>
        <input
          ref={monthInputRef}
          type="month"
          aria-label="Select month and year"
          className="history-calendar__picker-input"
          value={monthInputValue}
          onChange={(event) => {
            onNativeMonthChange(event.target.value);
          }}
        />
      </label>
    </div>
  );
}
