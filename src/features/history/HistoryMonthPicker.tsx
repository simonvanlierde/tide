import type { RefObject } from "react";
import { getMonthName } from "./calendar";

interface HistoryMonthPickerProps {
  isPickerOpen: boolean;
  hasNativeMonthInput: boolean;
  currentMonthIndex: number;
  currentYear: number;
  monthInputValue: `${number}-${number}`;
  yearOptions: number[];
  monthInputRef: RefObject<HTMLInputElement | null>;
  onNativeMonthChange: (value: string) => void;
  onFallbackMonthChange: (monthIndex: number) => void;
  onFallbackYearChange: (year: number) => void;
}

export function HistoryMonthPicker({
  isPickerOpen,
  hasNativeMonthInput,
  currentMonthIndex,
  currentYear,
  monthInputValue,
  yearOptions,
  monthInputRef,
  onNativeMonthChange,
  onFallbackMonthChange,
  onFallbackYearChange,
}: HistoryMonthPickerProps) {
  if (!isPickerOpen) {
    return null;
  }

  return (
    <div
      id="history-month-picker"
      className="calendar-picker-panel history-calendar__picker"
    >
      {hasNativeMonthInput ? (
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
      ) : (
        <div className="calendar-picker-fallback">
          <label className="calendar-picker-field">
            <span className="settings-label history-calendar__picker-label">
              Month
            </span>
            <select
              aria-label="Select month"
              className="history-calendar__picker-select"
              value={currentMonthIndex}
              onChange={(event) => {
                onFallbackMonthChange(Number(event.target.value));
              }}
            >
              {Array.from({ length: 12 }, (_, monthIndex) => (
                <option key={getMonthName(monthIndex)} value={monthIndex}>
                  {getMonthName(monthIndex)}
                </option>
              ))}
            </select>
          </label>
          <label className="calendar-picker-field">
            <span className="settings-label history-calendar__picker-label">
              Year
            </span>
            <select
              aria-label="Select year"
              className="history-calendar__picker-select"
              value={currentYear}
              onChange={(event) => {
                onFallbackYearChange(Number(event.target.value));
              }}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
