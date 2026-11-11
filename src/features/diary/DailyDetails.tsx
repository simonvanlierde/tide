import { Check, Cloud, CloudRain, NotebookPen, Sun } from "lucide-react";
import { type Ref, useEffect, useId, useRef, useState } from "react";
import { isIsoDate } from "../../data/schema";
import { type DailyDetails as Details, MAX_NOTE_LENGTH, MOODS, SYMPTOMS } from "../../domain/diary";
import type { IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions, useIsReadOnly, useLocale, useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { formatLongDate, formatShortDate } from "../../utils/date";
import "./diary.css";

const EMPTY: Details = { symptoms: null, mood: null, note: "" };
const sameDetails = (a: Details, b: Details) => JSON.stringify(a) === JSON.stringify(b);
const MOOD_ICONS = { low: CloudRain, okay: Cloud, good: Sun } as const;

/** Today's compact trigger, beside the log button. A dot marks a day that has details. */
export function DetailsButton({
  ref,
  day,
  open,
  controls,
  onOpen,
}: {
  ref?: Ref<HTMLButtonElement>;
  day: IsoDate;
  open: boolean;
  controls: string;
  onOpen: () => void;
}) {
  const state = useAppState();
  const t = useT();
  const hasDetails = day in state.detailsByDay;
  return (
    <button
      ref={ref}
      type="button"
      className="details-button"
      aria-label={t(hasDetails ? "diary.editDetails" : "diary.addDetails")}
      aria-expanded={open}
      aria-controls={controls}
      onClick={onOpen}
    >
      <AppIcon icon={NotebookPen} className="button-icon" />
      <span className="details-button__label">{t("diary.details")}</span>
      {hasDetails ? <span className="details-button__dot" aria-hidden="true" /> : null}
    </button>
  );
}

/** The Calendar's details: a trigger for the shown day and the month's detail-only days. */
export function DailyDetails({ today, month }: { today: IsoDate; month: IsoDate }) {
  const state = useAppState();
  const t = useT();
  const locale = useLocale();
  const [day, setDay] = useState(today);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const entries = Object.keys(state.detailsByDay)
    .filter((date) => date.startsWith(month.slice(0, 7)))
    .sort()
    .reverse();

  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }

  return (
    <div className="daily-details">
      <button
        ref={trigger}
        type="button"
        className="text-action daily-details__trigger"
        disabled={open}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setDay(today);
          setOpen(true);
        }}
      >
        {t(state.detailsByDay[today] ? "diary.editDetails" : "diary.addDetails")}
      </button>
      <div id={id}>{open ? <DetailsForm day={day} today={today} onDayChange={setDay} onClose={close} /> : null}</div>
      {!open && entries.length > 0 ? (
        <section className="daily-details__history" aria-labelledby={`${id}-history`}>
          <h2 id={`${id}-history`} className="section-title">
            {t("diary.history")}
          </h2>
          <ul>
            {entries.map((date) => (
              <li key={date}>
                <button
                  type="button"
                  className="text-action"
                  aria-label={t("diary.openDay", { date: formatLongDate(date as IsoDate, locale) })}
                  onClick={() => {
                    setDay(date as IsoDate);
                    setOpen(true);
                  }}
                >
                  {formatShortDate(date as IsoDate, locale)}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/**
 * Every tap saves: there is no draft to lose and no Save button to remember.
 * Clearing is the one destructive step, so it offers Undo until the next change.
 * `onDayChange` shows a date field (the Calendar); without it the form is for `day`.
 */
export function DetailsForm({
  day,
  today,
  onDayChange,
  onClose,
}: {
  day: IsoDate;
  today: IsoDate;
  onDayChange?: (day: IsoDate) => void;
  onClose: () => void;
}) {
  const state = useAppState();
  const actions = useAppStateActions();
  const readOnly = useIsReadOnly();
  const t = useT();
  const id = useId();
  const first = useRef<HTMLElement>(null);
  const value = state.detailsByDay[day] ?? EMPTY;
  const [status, setStatus] = useState<"saved" | { cleared: Details } | null>(null);
  const editable = !readOnly && day <= today;

  useEffect(() => {
    first.current?.focus();
  }, []);
  // Clear and Undo replace each other under the finger; focus follows.
  const clearButton = useRef<HTMLButtonElement>(null);
  const undoButton = useRef<HTMLButtonElement>(null);
  const [refocus, setRefocus] = useState<"clear" | "undo" | null>(null);
  useEffect(() => {
    if (refocus) {
      (refocus === "clear" ? clearButton : undoButton).current?.focus();
      setRefocus(null);
    }
  }, [refocus]);

  function save(next: Details) {
    if (!editable) return;
    actions.setDayDetails(day, next, today);
    setStatus("saved");
  }

  const symptoms = value.symptoms ?? [];

  return (
    <section className="diary-form" aria-label={t("diary.details")}>
      {onDayChange ? (
        <label className="diary-form__field" htmlFor={`${id}-date`}>
          {t("diary.date")}
          <input
            ref={first as React.RefObject<HTMLInputElement>}
            id={`${id}-date`}
            type="date"
            value={day}
            max={today}
            required
            onChange={(event) => {
              if (isIsoDate(event.target.value) && event.target.value <= today) {
                setStatus(null);
                onDayChange(event.target.value);
              }
            }}
          />
        </label>
      ) : null}
      <fieldset className="diary-form__group" disabled={!editable}>
        <legend>{t("diary.symptoms")}</legend>
        <div className="diary-form__chips">
          {SYMPTOMS.map((symptom, index) => {
            const pressed = symptoms.includes(symptom);
            return (
              <button
                key={symptom}
                ref={index === 0 && !onDayChange ? (first as React.RefObject<HTMLButtonElement>) : undefined}
                type="button"
                className="diary-chip"
                aria-pressed={pressed}
                onClick={() => {
                  const next = pressed ? symptoms.filter((entry) => entry !== symptom) : [...symptoms, symptom];
                  save({ ...value, symptoms: next.length ? next : null });
                }}
              >
                {pressed ? <AppIcon icon={Check} className="diary-chip__icon" /> : null}
                {t(`diary.symptom.${symptom}`)}
              </button>
            );
          })}
          <button
            type="button"
            className="diary-chip diary-chip--none"
            aria-pressed={value.symptoms?.length === 0}
            onClick={() => save({ ...value, symptoms: value.symptoms?.length === 0 ? null : [] })}
          >
            {value.symptoms?.length === 0 ? <AppIcon icon={Check} className="diary-chip__icon" /> : null}
            {t("diary.noSymptoms")}
          </button>
        </div>
      </fieldset>
      <fieldset className="diary-form__group" disabled={!editable}>
        <legend>{t("diary.mood")}</legend>
        <div className="diary-form__moods">
          {MOODS.map((mood) => (
            <button
              key={mood}
              type="button"
              className="diary-chip diary-chip--mood"
              aria-pressed={value.mood === mood}
              onClick={() => save({ ...value, mood: value.mood === mood ? null : mood })}
            >
              <AppIcon icon={MOOD_ICONS[mood]} className="diary-chip__mood-icon" />
              {t(`diary.mood.${mood}`)}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="diary-form__field" htmlFor={`${id}-note`}>
        {t("diary.note")}
        <textarea
          id={`${id}-note`}
          rows={2}
          maxLength={MAX_NOTE_LENGTH}
          value={value.note}
          disabled={!editable}
          aria-describedby={`${id}-note-help`}
          onChange={(event) => save({ ...value, note: event.target.value })}
        />
      </label>
      <p id={`${id}-note-help`} className="supporting-note diary-form__hint">
        {t("diary.noteHint", { max: MAX_NOTE_LENGTH })}
      </p>
      <p className="diary-form__status" role="status">
        {status === "saved" ? (
          <>
            <AppIcon icon={Check} className="text-action__icon" />
            {t("diary.saved")}
          </>
        ) : status ? (
          <>
            {t("diary.removed")}{" "}
            <button
              ref={undoButton}
              type="button"
              className="text-action"
              onClick={() => {
                save(status.cleared);
                setRefocus("clear");
              }}
            >
              {t("diary.undo")}
            </button>
          </>
        ) : null}
      </p>
      <div className="diary-form__actions">
        <button type="button" className="secondary-action diary-form__done" onClick={onClose}>
          {t("diary.done")}
        </button>
        {editable && !sameDetails(value, EMPTY) ? (
          <button
            ref={clearButton}
            type="button"
            className="text-action"
            onClick={() => {
              const cleared = value;
              actions.setDayDetails(day, EMPTY, today);
              setStatus({ cleared });
              setRefocus("undo");
            }}
          >
            {t("diary.clear")}
          </button>
        ) : null}
      </div>
    </section>
  );
}
