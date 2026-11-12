import { DropletOff, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions, useIsReadOnly, useLocale, useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { formatLongDate } from "../../utils/date";
import { DiaryFields } from "../diary/DailyDetails";
import { FlowGauge } from "./FlowGauge";

export function DayEditor({
  day,
  today,
  onClose,
  initialSection = "bleeding",
}: {
  day: IsoDate;
  today: IsoDate;
  onClose: () => void;
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: changing the date or entry section moves focus to the new fields.
  useEffect(() => {
    const target = panel.current?.querySelector(".day-editor__details[open]")
      ? panel.current?.querySelector<HTMLElement>(".diary-fields button:not(:disabled)")
      : (panel.current?.querySelector<HTMLElement>("input:checked:not(:disabled)") ??
        panel.current?.querySelector<HTMLElement>("input:not(:disabled), .day-editor__log:not(:disabled)"));
    (target ?? panel.current?.querySelector<HTMLElement>(".icon-close"))?.focus();
    const frame = requestAnimationFrame(() =>
      panel.current?.scrollIntoView?.({
        block: "nearest",
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      }),
    );
    return () => cancelAnimationFrame(frame);
  }, [day, initialSection]);

  useEffect(() => {
    if (!focusPending) return;
    const target = logged
      ? panel.current?.querySelector<HTMLElement>("input:checked:not(:disabled), input:not(:disabled)")
      : panel.current?.querySelector<HTMLElement>(".day-editor__log:not(:disabled)");
    (target ?? panel.current?.querySelector<HTMLElement>(".icon-close"))?.focus();
    setFocusPending(false);
  }, [focusPending, logged]);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Escape supplements the visible close button.
    <section
      className="day-editor inset-panel"
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
      <button type="button" className="secondary-action day-editor__done" onClick={onClose}>
        {t("diary.done")}
      </button>
    </section>
  );
}
