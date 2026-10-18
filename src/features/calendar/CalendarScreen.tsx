import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { type KeyboardEvent, type TouchEvent, useEffect, useRef } from "react";
import { MAX_PERIOD_RANGE_DAYS } from "../../domain/flow";
import type { IsoDate } from "../../domain/types";
import type { MessageKey } from "../../i18n";
import { useLocale, useT } from "../../state/provider";
import { useToday } from "../../state/useToday";
import { formatShortDate } from "../../utils/date";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarMonthPicker } from "./CalendarMonthPicker";
import type { CalendarCell } from "./calendar";
import { DayFlowPicker } from "./DayFlowPicker";
import { useCalendar } from "./useCalendar";

interface CalendarScreenProps {
  today?: IsoDate;
}

export function CalendarScreen(props: CalendarScreenProps) {
  const liveToday = useToday();
  const today = props.today ?? liveToday;
  const { days, helpKey, month, log } = useCalendar(today);
  const t = useT();
  const locale = useLocale();
  const articleRef = useRef<HTMLElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const wantPinpoint = useRef(false);

  // Pop the today cell so people see exactly where they landed after "Today".
  // goToToday changes the month inside a transition, so wait for the current
  // month to actually render (month.isCurrent flips true) before reaching for
  // the cell. Skip the pop under reduced motion, but still clear the request.
  useEffect(() => {
    if (!wantPinpoint.current || !month.isCurrent) {
      return;
    }
    wantPinpoint.current = false;
    if (prefersReducedMotion()) {
      return;
    }
    const cell = articleRef.current?.querySelector<HTMLElement>(
      ".calendar-grid__day.is-today",
    );
    if (typeof cell?.animate === "function") {
      cell.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.18)" },
          { transform: "scale(1)" },
        ],
        {
          duration: 460,
          easing: "ease-out",
        },
      );
    }
  }, [month.isCurrent]);

  function handleGoToToday() {
    wantPinpoint.current = true;
    month.goToToday();
  }

  // Picking a range happens on the grid, so start there: focus its tab stop.
  function handleStartRange() {
    log.startRangePick();
    articleRef.current
      ?.querySelector<HTMLElement>('.calendar-grid__day[tabindex="0"]')
      ?.focus();
  }

  function handleTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    if (touch) {
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    }
  }

  // A mostly-horizontal swipe flips the month; swipe left for next (pages
  // forward), right for previous. Small or vertical drags are ignored so taps
  // and scrolls still work.
  function handleTouchEnd(event: TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) {
      return;
    }

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy)) {
      return;
    }

    if (dx < 0) {
      month.goToNext();
    } else {
      month.goToPrevious();
    }
  }

  // PageUp/PageDown change month (the ARIA date-grid convention). Arrow keys are
  // left alone — the flow gauge is a radiogroup that owns them. Skip the picker's
  // month/year dropdowns, which handle their own keys.
  function handleKeyDown(event: KeyboardEvent) {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }
    if (event.key === "Escape" && log.rangePick) {
      log.cancelRangePick();
    } else if (event.key === "PageUp") {
      event.preventDefault();
      month.goToPrevious();
    } else if (event.key === "PageDown") {
      event.preventDefault();
      month.goToNext();
    }
  }

  return (
    <section className="utility-screen">
      <h1 className="visually-hidden">{t("calendar.title")}</h1>
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: PageUp/PageDown month paging is a keyboard convenience layered over the buttons below; the calendar stays fully operable via those focusable controls. */}
      <article
        ref={articleRef}
        className="utility-card calendar"
        onKeyDown={handleKeyDown}
      >
        <div className="calendar__header" data-testid="calendar-header">
          <button
            type="button"
            className="calendar__nav"
            aria-label={t("calendar.previousMonth")}
            onClick={month.goToPrevious}
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            className="calendar-picker-button calendar__month-button"
            aria-expanded={month.picker.isPickerOpen}
            aria-controls="calendar-month-picker"
            onClick={month.togglePicker}
          >
            {month.label}
            <ChevronDown
              aria-hidden="true"
              size={16}
              className="calendar__month-caret"
            />
          </button>
          <button
            type="button"
            className="calendar__nav"
            aria-label={t("calendar.nextMonth")}
            onClick={month.goToNext}
          >
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </div>
        <CalendarMonthPicker {...month.picker} />
        <div
          className="calendar-swipe"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <CalendarGrid
            days={days}
            selectedDay={log.selectedDay ?? log.rangePick?.from ?? null}
            justLoggedDay={log.justLoggedDay}
            onSelectDay={log.selectDay}
          />
        </div>
        <CalendarLegend days={days} />
        {log.selectedDay ? (
          <DayFlowPicker
            day={log.selectedDay}
            intensity={log.selectedIntensity}
            isLogged={log.isSelectedLogged}
            onSelect={(intensity) =>
              log.setDayIntensity(log.selectedDay as IsoDate, intensity)
            }
            onRemove={() => log.removeDay(log.selectedDay as IsoDate)}
            onClose={log.closePicker}
          />
        ) : log.rangePick ? (
          <p className="supporting-note calendar__help" role="status">
            {log.rangePick.from === null
              ? t("calendar.rangePickFirst")
              : t(
                  log.rangePick.tooLong
                    ? "calendar.rangeTooLong"
                    : "calendar.rangePickLast",
                  {
                    date: formatShortDate(log.rangePick.from, locale),
                    max: MAX_PERIOD_RANGE_DAYS,
                  },
                )}
          </p>
        ) : log.justLoggedDay || log.justLoggedRange ? (
          // A one-tap log or a range wrote data; say what, and make undo one
          // tap too.
          <p className="supporting-note calendar__help" role="status">
            {t(
              log.forecastMoved
                ? "calendar.justLoggedForecast"
                : "calendar.justLogged",
              {
                date: log.justLoggedRange
                  ? `${formatShortDate(log.justLoggedRange.from, locale)} – ${formatShortDate(log.justLoggedRange.to, locale)}`
                  : formatShortDate(log.justLoggedDay as IsoDate, locale),
              },
            )}{" "}
            <button
              type="button"
              className="text-action calendar__undo"
              onClick={log.undoJustLogged}
            >
              {t("calendar.undo")}
            </button>
          </p>
        ) : (
          <p className="supporting-note calendar__help">{t(helpKey)}</p>
        )}
        {log.selectedDay ? null : (
          // One button that turns into Cancel, so focus stays put when a
          // pick is cancelled.
          <button
            type="button"
            className="text-action calendar__range"
            onClick={log.rangePick ? log.cancelRangePick : handleStartRange}
          >
            {t(log.rangePick ? "common.cancel" : "calendar.logRange")}
          </button>
        )}
        {month.isCurrent ? null : (
          <button
            type="button"
            className="calendar__today"
            aria-label={t("calendar.goToCurrentMonth")}
            onClick={handleGoToToday}
          >
            {t("calendar.today")}
          </button>
        )}
      </article>
    </section>
  );
}

function prefersReducedMotion() {
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
}

const LEGEND_ITEMS = [
  // The same words as the Today dial's legend: one name per marker.
  { key: "logged", labelKey: "legend.period" },
  { key: "predicted", labelKey: "legend.expected" },
  { key: "fertile", labelKey: "legend.fertileWindow" },
  { key: "ovulation", labelKey: "legend.ovulation" },
] as const satisfies readonly { key: string; labelKey: MessageKey }[];

const LEGEND_KEY = {
  "predicted-period": "predicted",
  fertile: "fertile",
  ovulation: "ovulation",
} as const;

// Only the markers actually on screen this month get a key entry; a legend
// for things that aren't there is noise. The per-day buttons announce their
// own marker to screen readers, so the visual legend is decorative here.
function CalendarLegend({ days }: { days: CalendarCell[] }) {
  const t = useT();
  const present = new Set(
    days.map((day) =>
      day.isLogged ? "logged" : day.estimate && LEGEND_KEY[day.estimate],
    ),
  );
  const items = LEGEND_ITEMS.filter((item) => present.has(item.key));
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="calendar-legend" aria-hidden="true">
      {items.map((item) => (
        <span key={item.key} className="calendar-legend__item">
          <span
            className={`calendar-legend__swatch calendar-legend__swatch--${item.key}`}
          />
          {t(item.labelKey)}
        </span>
      ))}
    </div>
  );
}
