const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface HistoryMonthPickerProps {
  isPickerOpen: boolean;
  year: number;
  monthIndex: number;
  years: number[];
  onSelect: (year: number, monthIndex: number) => void;
}

export function HistoryMonthPicker({
  isPickerOpen,
  year,
  monthIndex,
  years,
  onSelect,
}: HistoryMonthPickerProps) {
  if (!isPickerOpen) {
    return null;
  }

  return (
    <div
      id="history-month-picker"
      className="calendar-picker-panel history-calendar__picker"
    >
      <span className="settings-label history-calendar__picker-label">
        Jump to month
      </span>
      <div className="history-calendar__picker-selects">
        <select
          aria-label="Month"
          className="history-calendar__picker-input"
          value={monthIndex}
          onChange={(event) => onSelect(year, Number(event.target.value))}
        >
          {MONTH_NAMES.map((name, index) => (
            <option key={name} value={index}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label="Year"
          className="history-calendar__picker-input"
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
