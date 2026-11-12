import { CalendarRange, ChevronDown, ChevronLeft, ChevronRight, NotebookPen } from "lucide-react";
import { type KeyboardEvent, type ReactNode, type TouchEvent, useEffect, useRef, useState } from "react";
import { MAX_PERIOD_RANGE_DAYS } from "../../domain/flow";
import type { IsoDate } from "../../domain/types";
import { useAppStateActions, useLocale, useT } from "../../state/provider";
import { useToday } from "../../state/useToday";
import { AppIcon } from "../../ui/icons";
import { formatShortDate } from "../../utils/date";
import { DayEditor } from "../log/DayEditor";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarMonthPicker } from "./CalendarMonthPicker";
import type { CalendarCell } from "./calendar";
import { useCalendar } from "./useCalendar";

interface CalendarScreenProps {
  today?: IsoDate;
}

function revealDate(cell: HTMLElement, panel: HTMLElement) {
  if (getComputedStyle(panel).position !== "fixed") return;
  const bounds = (cell.closest("tr") ?? cell).getBoundingClientRect();
  const top = (window.visualViewport?.offsetTop ?? 0) + 12;
  const bottom = panel.getBoundingClientRect().top - 12;
  if (bounds.bottom > bottom) window.scrollBy({ top: bounds.bottom - bottom, behavior: "instant" });
  else if (bounds.top < top) window.scrollBy({ top: bounds.top - top, behavior: "instant" });
}

export function CalendarScreen(props: CalendarScreenProps) {
  const liveToday = useToday();
  const today = props.today ?? liveToday;
  const { days, helpKey, month, log } = useCalendar(today);
  const actions = useAppStateActions();
  const t = useT();
  const locale = useLocale();
  const articleRef = useRef<HTMLElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const wantPinpoint = useRef(false);
  const [editorSection, setEditorSection] = useState<"bleeding" | "details">("bleeding");

  useEffect(() => {
    if (!log.selectedDay) return;
    const panel = articleRef.current?.querySelector<HTMLElement>(".day-editor");
    const cell =
      articleRef.current?.querySelectorAll<HTMLElement>(".calendar-grid__day")[
        days.findIndex((entry) => entry.value === log.selectedDay)
      ];
    if (!panel || !cell) return;
    const viewport = window.visualViewport;
    let frame = 0;
    function scheduleReveal() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const focused = document.activeElement?.closest<HTMLElement>(".calendar-grid__day");
        if (cell && panel) revealDate(focused ?? cell, panel);
      });
    }
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleReveal);
    observer?.observe(panel);
    // Position and page padding can change without resizing the sheet.
    const layout = new MutationObserver(scheduleReveal);
    layout.observe(panel, { attributes: true, attributeFilter: ["style"] });
    const shell = panel.closest(".app-shell");
    if (shell) layout.observe(shell, { attributes: true, attributeFilter: ["style"] });
    scheduleReveal();
    window.addEventListener("resize", scheduleReveal);
    viewport?.addEventListener("resize", scheduleReveal);
    viewport?.addEventListener("scroll", scheduleReveal);
    return () => {
      observer?.disconnect();
      layout.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", scheduleReveal);
      viewport?.removeEventListener("resize", scheduleReveal);
      viewport?.removeEventListener("scroll", scheduleReveal);
    };
  }, [days, log.selectedDay]);

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
    const cell = articleRef.current?.querySelector<HTMLElement>(".calendar-grid__day.is-today");
    if (typeof cell?.animate === "function") {
      cell.animate([{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }], {
        duration: 460,
        easing: "ease-out",
      });
    }
  }, [month.isCurrent]);

  function handleGoToToday() {
    wantPinpoint.current = true;
    month.goToToday();
  }

  // Picking a range happens on the grid, so start there: focus its tab stop.
  function handleStartRange() {
    log.startRangePick();
    articleRef.current?.querySelector<HTMLElement>('.calendar-grid__day[tabindex="0"]')?.focus();
  }

  function focusDay(day: IsoDate | null) {
    const cells = articleRef.current?.querySelectorAll<HTMLButtonElement>(".calendar-grid__day");
    const cell = cells?.[days.findIndex((entry) => entry.value === day)];
    const fallback = articleRef.current?.querySelector<HTMLElement>(
      '.calendar-grid__day[tabindex="0"]:not(.is-future)',
    );
    (
      (cell?.disabled ? null : cell) ??
      fallback ??
      articleRef.current?.querySelector<HTMLElement>(".calendar__nav")
    )?.focus();
  }

  function handleUndo() {
    const day = log.justLoggedRange?.from ?? null;
    log.undoJustLogged();
    focusDay(day);
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
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "Tab"].includes(event.key)) {
      requestAnimationFrame(() => {
        const cell = document.activeElement?.closest<HTMLElement>(".calendar-grid__day");
        const panel = articleRef.current?.querySelector<HTMLElement>(".day-editor");
        if (cell && panel) revealDate(cell, panel);
      });
    }
    if (event.key === "Escape" && log.selectedDay) {
      event.preventDefault();
      const day = log.selectedDay;
      log.closePicker();
      focusDay(day);
      return;
    }
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLSelectElement ||
      event.target instanceof HTMLTextAreaElement
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
      <article ref={articleRef} className="utility-card calendar" onKeyDown={handleKeyDown}>
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
            <ChevronDown aria-hidden="true" size={16} className="calendar__month-caret" />
          </button>
          <button type="button" className="calendar__nav" aria-label={t("calendar.nextMonth")} onClick={month.goToNext}>
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </div>
        <CalendarMonthPicker {...month.picker} />
        <div className="calendar-swipe" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <CalendarGrid
            days={days}
            selectedDay={log.selectedDay ?? log.rangePick?.from ?? null}
            onSelectDay={(day) => {
              const cell = days.find((entry) => entry.value === day);
              if (log.rangePick) {
                log.selectRangeDay(day);
              } else {
                if (!log.selectedDay) setEditorSection(cell?.hasDetails && !cell.isLogged ? "details" : "bleeding");
                log.openDay(day);
              }
            }}
          />
        </div>
        <CalendarLegend days={days} />
        {log.selectedDay ? (
          <DayEditor
            day={log.selectedDay}
            today={today}
            initialSection={editorSection}
            onLog={() => actions.setSetting("calendarHelpDismissed", true)}
            onClose={() => {
              const day = log.selectedDay;
              log.closePicker();
              focusDay(day);
            }}
          />
        ) : log.rangePick ? (
          <p className="supporting-note calendar__help" role="status">
            {log.rangePick.from === null
              ? t("calendar.rangePickFirst")
              : t(log.rangePick.tooLong ? "calendar.rangeTooLong" : "calendar.rangePickLast", {
                  date: formatShortDate(log.rangePick.from, locale),
                  max: MAX_PERIOD_RANGE_DAYS,
                })}
          </p>
        ) : log.justLoggedRange ? (
          <CalendarFeedback onPause={log.setFeedbackPaused}>
            {t(log.forecastMoved ? "calendar.justLoggedForecast" : "calendar.justLogged", {
              date: `${formatShortDate(log.justLoggedRange.from, locale)} – ${formatShortDate(log.justLoggedRange.to, locale)}`,
            })}{" "}
            <button type="button" className="text-action calendar__undo" onClick={handleUndo}>
              {t("calendar.undo")}
            </button>
          </CalendarFeedback>
        ) : helpKey === "calendar.tapHelp" ? null : (
          // First-use help lasts until a Calendar bleeding log; future months
          // keep their separate explanation.
          <p className="supporting-note calendar__help">{t(helpKey)}</p>
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
        {log.selectedDay ? null : (
          <div className="calendar__actions">
            {/* Keep the same button when it becomes Cancel, so focus stays put. */}
            <button
              type="button"
              className="calendar__action"
              onClick={log.rangePick ? log.cancelRangePick : handleStartRange}
            >
              {log.rangePick ? null : <CalendarRange aria-hidden="true" size={18} strokeWidth={1.8} />}
              {t(log.rangePick ? "common.cancel" : "calendar.logRange")}
            </button>
          </div>
        )}
      </article>
    </section>
  );
}

function CalendarFeedback({ children, onPause }: { children: ReactNode; onPause: (paused: boolean) => void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    onPause(hovered || focused);
    return () => onPause(false);
  }, [hovered, focused, onPause]);
  return (
    <p
      className="supporting-note calendar__help"
      role="status"
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => setFocused(event.currentTarget.contains(event.relatedTarget))}
    >
      {children}
    </p>
  );
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

const LEGEND_ITEMS = [
  // The same words as the Today dial's legend: one name per marker.
  { key: "logged", labelKey: "legend.period" },
  { key: "predicted", labelKey: "legend.expected" },
  { key: "fertile", labelKey: "legend.fertile" },
  { key: "ovulation", labelKey: "legend.ovulation" },
  { key: "cycle-day", labelKey: "legend.cycleDay" },
  { key: "details", labelKey: "diary.details" },
] as const satisfies readonly { key: string; labelKey: string }[];

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
  const present = new Set<string | null>(
    days.map((day) => (day.isLogged ? "logged" : day.estimate && LEGEND_KEY[day.estimate])),
  );
  if (days.some((day) => day.cycleDay)) {
    present.add("cycle-day");
  }
  if (days.some((day) => day.hasDetails)) present.add("details");
  const items = LEGEND_ITEMS.filter((item) => present.has(item.key));
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="calendar-legend" aria-hidden="true">
      {items.map((item) => (
        <span key={item.key} className="calendar-legend__item">
          {item.key === "details" ? (
            <AppIcon icon={NotebookPen} className="calendar-legend__details" />
          ) : item.key === "cycle-day" ? (
            <span className="calendar-legend__count">3</span>
          ) : (
            <span className={`calendar-legend__swatch calendar-legend__swatch--${item.key}`} />
          )}
          {t(item.labelKey)}
        </span>
      ))}
    </div>
  );
}
