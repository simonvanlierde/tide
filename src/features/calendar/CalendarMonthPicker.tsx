import { useMemo } from "react";
import { useLocale, useT } from "../../state/provider";
import { getMonthNames } from "../../utils/date";

export interface CalendarMonthPickerProps {
  isPickerOpen: boolean;
  year: number;
  monthIndex: number;
  years: number[];
  onSelect: (year: number, monthIndex: number) => void;
}

export function CalendarMonthPicker({
  isPickerOpen,
  year,
  monthIndex,
  years,
  onSelect,
}: CalendarMonthPickerProps) {
  const t = useT();
  const locale = useLocale();
  // Before the early return so the hook order stays stable across renders.
  const monthNames = useMemo(() => getMonthNames(locale), [locale]);

  if (!isPickerOpen) {
    return null;
  }

  return (
    <div
      id="calendar-month-picker"
      className="calendar-picker-panel calendar__picker"
    >
      <span className="settings-label calendar__picker-label">
        {t("calendar.jumpToMonth")}
      </span>
      <div className="calendar__picker-selects">
        <select
          aria-label={t("calendar.month")}
          className="calendar__picker-input"
          value={monthIndex}
          onChange={(event) => onSelect(year, Number(event.target.value))}
        >
          {monthNames.map((name, index) => (
            <option key={name} value={index}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label={t("calendar.year")}
          className="calendar__picker-input"
          value={year}
          onChange={(event) => onSelect(Number(event.target.value), monthIndex)}
        >
          {years.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
