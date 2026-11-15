import { CalendarPlus } from "lucide-react";
import { type ReactNode, useState } from "react";
import { getExpectedCycles } from "../../domain/cycle";
import type { IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions, useForecast, useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";

/** How many expected periods a calendar file can hold; the first is the default. */
const CALENDAR_COUNTS = [3, 6, 12] as const;

interface CalendarExportProps {
  today: IsoDate;
  onDone: (status: { kind: "calendar"; periods: number; fertile: boolean }) => void;
  onError: (text: string) => void;
  /** The status or error the last export left, shown under the options. */
  feedback: ReactNode;
}

export function CalendarExport({ today, onDone, onError, feedback }: CalendarExportProps) {
  const state = useAppState();
  const actions = useAppStateActions();
  const t = useT();
  const [fertile, setFertile] = useState(false);
  // In memory only: Tide stores nothing beyond your data and settings.
  const [count, setCount] = useState<number>(CALENDAR_COUNTS[0]);
  const showFertility = state.settings.showFertility === true;
  const expectedCycles = getExpectedCycles(useForecast(today), today, count);

  async function handleExport() {
    const calendarId = state.settings.calendarId ?? crypto.randomUUID();
    if (state.settings.calendarId === null) {
      actions.setSetting("calendarId", calendarId);
    }
    try {
      // Loaded on first use, like the other apps' import formats.
      const { downloadCalendar } = await import("../../data/calendarFile");
      downloadCalendar(expectedCycles, {
        today,
        fertility: showFertility && fertile,
        words: {
          period: t("legend.expected"),
          fertile: t("legend.fertileWindow"),
          disclaimer: t("settings.fertilityDisclaimer"),
        },
        now: new Date(),
        calendarId,
      });
    } catch {
      onError(t("settings.calendarError"));
      return;
    }
    onDone({ kind: "calendar", periods: expectedCycles.length, fertile: showFertility && fertile });
  }

  // Nothing to put in a calendar until there is a forecast.
  if (expectedCycles.length === 0) return null;
  return (
    <div className="data-group">
      <button type="button" className="secondary-action" aria-describedby="calendar-help" onClick={handleExport}>
        <span className="button-label">
          <AppIcon icon={CalendarPlus} className="button-icon" />
          <span>{t("settings.exportCalendar")}</span>
        </span>
      </button>
      <p id="calendar-help" className="supporting-note">
        {t("settings.calendarHelp")}
      </p>
      {/* The options sit right under the button and its note, so they read as part of it. */}
      <div className="calendar-export__options">
        {/* The swatches are the calendar legend's own, so each row shows
            what it adds to the calendar app. */}
        {/* biome-ignore lint/a11y/useSemanticElements: a labelled div group, as in ThemeSection; <fieldset> brings unwanted default styling. */}
        <div className="settings-row calendar-export__row" role="group" aria-labelledby="calendar-periods">
          <span className="settings-label calendar-export__label">
            <i className="calendar-legend__swatch calendar-legend__swatch--predicted" aria-hidden="true" />
            <span id="calendar-periods">{t("settings.calendarPeriods")}</span>
          </span>
          <div className="segmented segmented--count">
            {CALENDAR_COUNTS.map((option) => (
              <button
                key={option}
                type="button"
                className={count === option ? "segmented__option is-active" : "segmented__option"}
                aria-pressed={count === option}
                onClick={() => setCount(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        {showFertility ? (
          <div className="settings-row settings-row--switch calendar-export__row">
            <span className="settings-label calendar-export__label">
              <i className="calendar-legend__swatch calendar-legend__swatch--fertile" aria-hidden="true" />
              <span id="calendar-fertile">{t("settings.calendarFertility")}</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={fertile}
              aria-labelledby="calendar-fertile"
              className="switch"
              onClick={() => setFertile(!fertile)}
            />
          </div>
        ) : null}
      </div>
      {feedback}
    </div>
  );
}
