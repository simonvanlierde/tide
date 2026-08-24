import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { type KeyboardEvent, type TouchEvent, useEffect, useRef } from "react";
import type { IsoDate } from "../../domain/types";
import type { MessageKey } from "../../i18n";
import { useLocale, useT } from "../../state/provider";
import { formatShortDate, getTodayIsoDate } from "../../utils/date";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarMonthPicker } from "./CalendarMonthPicker";
import { DayFlowPicker } from "./DayFlowPicker";
import { useCalendar } from "./useCalendar";

interface CalendarScreenProps {
  today?: IsoDate;
}

export function CalendarScreen({
  today = getTodayIsoDate(),
}: CalendarScreenProps) {
  const model = useCalendar(today);
  const t = useT();
  const locale = useLocale();
  const articleRef = useRef<HTMLElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const wantPinpoint = useRef(false);

  // Pop the today cell so people see exactly where they landed after "Today".
  // goToToday changes the month inside a transition, so wait for the current
  // month to actually render (isCurrentMonth flips true) before reaching for the
  // cell. Skip the pop under reduced motion, but still clear the request.
  useEffect(() => {
    if (!wantPinpoint.current || !model.isCurrentMonth) {
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
        { duration: 460, easing: "ease-out" },
      );
    }
  }, [model.isCurrentMonth]);

  function handleGoToToday() {
    wantPinpoint.current = true;
    model.goToToday();
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
      model.goToNextMonth();
    } else {
      model.goToPreviousMonth();
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
    if (event.key === "PageUp") {
      event.preventDefault();
      model.goToPreviousMonth();
    } else if (event.key === "PageDown") {
      event.preventDefault();
      model.goToNextMonth();
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
            onClick={model.goToPreviousMonth}
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            className="calendar-picker-button calendar__month-button"
            aria-expanded={model.isPickerOpen}
            aria-controls="calendar-month-picker"
            onClick={model.openPicker}
          >
            {model.monthLabel}
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
            onClick={model.goToNextMonth}
          >
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </div>
        <CalendarMonthPicker {...model.monthPicker} />
        <div
          className="calendar-swipe"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <CalendarGrid
            monthDays={model.monthDays}
            loggedDays={model.loggedDays}
            dayIntensity={model.dayIntensity}
            cycleDayNumbers={model.cycleDayNumbers}
            showCycleDayNumbers={model.showCycleDayNumbers}
            cycleMarkers={model.cycleMarkers}
            selectedDay={model.selectedDay}
            justLoggedDay={model.justLoggedDay}
            onSelectDay={model.selectDay}
          />
        </div>
        <CalendarLegend present={model.presentMarkers} />
        {model.selectedDay ? (
          <DayFlowPicker
            day={model.selectedDay}
            intensity={model.selectedIntensity}
            isLogged={model.isSelectedLogged}
            onSelect={(intensity) =>
              model.setDayIntensity(model.selectedDay as IsoDate, intensity)
            }
            onRemove={() => model.removeDay(model.selectedDay as IsoDate)}
            onClose={model.closePicker}
          />
        ) : model.justLoggedDay ? (
          // A one-tap log wrote data; say what, and make undo one tap too.
          <p className="supporting-note calendar__help" role="status">
            {t(
              model.forecastMoved
                ? "calendar.justLoggedForecast"
                : "calendar.justLogged",
              { date: formatShortDate(model.justLoggedDay, locale) },
            )}{" "}
            <button
              type="button"
              className="text-action calendar__undo"
              onClick={model.undoJustLogged}
            >
              {t("calendar.undo")}
            </button>
          </p>
        ) : (
          <p className="supporting-note calendar__help">
            {t(
              model.periodDays.length === 0
                ? "calendar.emptyHelp"
                : model.isWholeMonthFuture
                  ? "calendar.futureHelp"
                  : "calendar.tapHelp",
            )}
          </p>
        )}
        {model.isCurrentMonth ? null : (
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
  { key: "logged", labelKey: "calendar.legend.logged" },
  { key: "predicted", labelKey: "calendar.legend.predicted" },
  { key: "fertile", labelKey: "calendar.legend.fertile" },
  { key: "ovulation", labelKey: "calendar.legend.ovulation" },
] as const satisfies readonly { key: string; labelKey: MessageKey }[];

export type LegendKey = (typeof LEGEND_ITEMS)[number]["key"];

// Only the markers actually on screen this month get a key entry; a legend
// for things that aren't there is noise. The per-day buttons announce their
// own marker to screen readers, so the visual legend is decorative here.
function CalendarLegend({ present }: { present: ReadonlySet<LegendKey> }) {
  const t = useT();
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
