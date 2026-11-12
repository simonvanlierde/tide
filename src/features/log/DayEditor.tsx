import { DropletOff, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions, useIsReadOnly, useLocale, useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { formatLongDate } from "../../utils/date";
import { DiaryFields } from "../diary/DailyDetails";
import { FlowGauge } from "./FlowGauge";

const FLOATING_QUERY = "(max-width: 600px) and (min-height: 480px)";

export function DayEditor({
  day,
  today,
  onClose,
  onLog,
  initialSection = "bleeding",
}: {
  day: IsoDate;
  today: IsoDate;
  onClose: () => void;
  onLog?: () => void;
  initialSection?: "bleeding" | "details";
}) {
  const state = useAppState();
  const actions = useAppStateActions();
  const readOnly = useIsReadOnly();
  const t = useT();
  const locale = useLocale();
  const id = useId();
  const panel = useRef<HTMLElement>(null);
  const logged = day in state.intensityByDay;
  const editable = !readOnly && day <= today;
  const [focusPending, setFocusPending] = useState(false);
  const [floating, setFloating] = useState(() => window.matchMedia?.(FLOATING_QUERY).matches ?? false);

  useEffect(() => {
    const media = window.matchMedia?.(FLOATING_QUERY);
    if (!media) return;
    const update = () => setFloating(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!floating) return;
    const tabs = document.querySelector<HTMLElement>(".tab-bar");
    const viewport = window.visualViewport;
    const shell = panel.current?.closest<HTMLElement>(".app-shell");
    function update() {
      shell?.style.setProperty("--day-editor-height", `${panel.current?.getBoundingClientRect().height ?? 0}px`);
      const tabHeight = tabs?.getBoundingClientRect().height ?? 80;
      const keyboardInset = Math.max(
        0,
        window.innerHeight - (viewport?.height ?? window.innerHeight) - (viewport?.offsetTop ?? 0),
      );
      panel.current?.style.setProperty("--day-editor-bottom", `${Math.max(tabHeight, keyboardInset) + 8}px`);
      panel.current?.style.setProperty(
        "--day-editor-available-height",
        `${(viewport?.height ?? window.innerHeight) - (keyboardInset > tabHeight ? 0 : tabHeight) - 24}px`,
      );
    }
    update();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    if (tabs) observer?.observe(tabs);
    if (panel.current) observer?.observe(panel.current);
    window.addEventListener("resize", update);
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    return () => {
      observer?.disconnect();
      shell?.style.removeProperty("--day-editor-height");
      window.removeEventListener("resize", update);
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
    };
  }, [floating]);

  function focusControl(target: HTMLElement | null | undefined) {
    target?.focus({ preventScroll: floating });
    if (!floating || !target) return;
    const body = panel.current?.querySelector<HTMLElement>(".day-editor__body");
    if (!body?.contains(target)) return;
    const control = target.closest("label") ?? target;
    const bounds = control.getBoundingClientRect();
    const viewport = body.getBoundingClientRect();
    if (bounds.top < viewport.top) body.scrollTop += bounds.top - viewport.top;
    else if (bounds.bottom > viewport.bottom) body.scrollTop += bounds.bottom - viewport.bottom;
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: only a date or entry change moves focus; responsive mode changes preserve active editing.
  useEffect(() => {
    const body = panel.current?.querySelector<HTMLElement>(".day-editor__body");
    if (floating && body) body.scrollTop = 0;
    const details = panel.current?.querySelector<HTMLDetailsElement>(".day-editor__details");
    if (!logged && state.detailsByDay[day] && details) details.open = true;
    const target = panel.current?.querySelector(".day-editor__details[open]")
      ? panel.current?.querySelector<HTMLElement>(".diary-fields button:not(:disabled)")
      : (panel.current?.querySelector<HTMLElement>("input:checked:not(:disabled)") ??
        panel.current?.querySelector<HTMLElement>("input:not(:disabled), .day-editor__log:not(:disabled)"));
    focusControl(target ?? panel.current?.querySelector<HTMLElement>(".icon-close"));
    if (floating) return;
    const frame = requestAnimationFrame(() =>
      panel.current?.scrollIntoView?.({
        block: "nearest",
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      }),
    );
    return () => cancelAnimationFrame(frame);
  }, [day, initialSection]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: focusControl reads this render's panel and responsive mode.
  useEffect(() => {
    if (!focusPending) return;
    const target = logged
      ? panel.current?.querySelector<HTMLElement>("input:checked:not(:disabled), input:not(:disabled)")
      : panel.current?.querySelector<HTMLElement>(".day-editor__log:not(:disabled)");
    focusControl(target ?? panel.current?.querySelector<HTMLElement>(".icon-close"));
    setFocusPending(false);
  }, [focusPending, logged, floating]);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Escape supplements the visible close button.
    <section
      className="day-editor inset-panel"
      data-floating={floating}
      aria-labelledby={`${id}-title`}
      ref={panel}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="day-editor__head">
        <h2 id={`${id}-title`}>{t("dayEditor.title", { date: formatLongDate(day, locale) })}</h2>
        <button type="button" className="icon-close" aria-label={t("common.close")} onClick={onClose}>
          <AppIcon icon={X} />
        </button>
      </div>
      <div className="day-editor__body">
        {logged ? (
          <>
            <fieldset className="day-editor__bleeding" disabled={!editable}>
              <FlowGauge
                selected={state.intensityByDay[day]}
                name={`day-flow-${id}`}
                autoFocus={false}
                onSelect={(intensity) => {
                  if (editable) actions.setDayIntensity(day, intensity, today);
                }}
              />
            </fieldset>
            <button
              type="button"
              className="text-action day-editor__remove"
              disabled={readOnly}
              onClick={() => {
                if (!readOnly) {
                  actions.togglePeriodDay(day, today);
                  setFocusPending(true);
                }
              }}
            >
              <AppIcon icon={DropletOff} className="text-action__icon" />
              {t("calendar.notBleeding")}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="secondary-action day-editor__log"
            disabled={!editable}
            onClick={() => {
              if (!editable) return;
              actions.togglePeriodDay(day, today);
              onLog?.();
              setFocusPending(true);
            }}
          >
            {t("dayEditor.logBleeding")}
          </button>
        )}
        <details className="day-editor__details" open={initialSection === "details"}>
          <summary>{t("dayEditor.moreDetails")}</summary>
          <DiaryFields key={day} day={day} today={today} />
        </details>
      </div>
    </section>
  );
}
