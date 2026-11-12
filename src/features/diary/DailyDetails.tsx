import { Check, Cloud, CloudRain, NotebookPen, Sun } from "lucide-react";
import { type Ref, useEffect, useId, useRef, useState } from "react";
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

/** The Calendar owns the date and the single editor these controls open. */
export function DailyDetails({
  today,
  day: target,
  month,
  onOpenDay,
}: {
  today: IsoDate;
  day?: IsoDate;
  month: IsoDate;
  onOpenDay: (day: IsoDate) => void;
}) {
  const state = useAppState();
  const t = useT();
  const locale = useLocale();
  const id = useId();
  const entries = Object.keys(state.detailsByDay)
    .filter((date) => date.startsWith(month.slice(0, 7)))
    .sort()
    .reverse();
  return (
    <div className="daily-details">
      <button
        type="button"
        className={target ? "calendar__action daily-details__trigger" : "text-action daily-details__trigger"}
        onClick={() => onOpenDay(target ?? today)}
      >
        {target ? <AppIcon icon={NotebookPen} className="button-icon" /> : null}
        {target
          ? t(state.detailsByDay[target] ? "diary.editDetailsFor" : "diary.addDetailsFor", {
              date: formatShortDate(target, locale),
            })
          : t(state.detailsByDay[today] ? "diary.editDetails" : "diary.addDetails")}
      </button>
      {entries.length > 0 ? (
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
                  onClick={() => onOpenDay(date as IsoDate)}
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

/** Every tap saves; Undo never overwrites newer details from another tab. */
export function DiaryFields({ day, today }: { day: IsoDate; today: IsoDate }) {
  const state = useAppState();
  const actions = useAppStateActions();
  const readOnly = useIsReadOnly();
  const t = useT();
  const id = useId();
  const value = state.detailsByDay[day] ?? EMPTY;
  const [status, setStatus] = useState<"saved" | { cleared: Details } | null>(null);
  const editable = !readOnly && day <= today;
  // Undo restores the cleared snapshot, so it only stands while the day is still
  // empty: an edit since then (here or in another tab) would be overwritten.
  const undoable = status !== null && status !== "saved" && sameDetails(value, EMPTY);

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
    <div className="diary-fields">
      <fieldset className="diary-form__group" disabled={!editable}>
        <legend>{t("diary.symptoms")}</legend>
        <div className="diary-form__chips">
          {SYMPTOMS.map((symptom) => {
            const pressed = symptoms.includes(symptom);
            return (
              <button
                key={symptom}
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
            className="diary-chip"
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
              <AppIcon icon={value.mood === mood ? Check : MOOD_ICONS[mood]} className="diary-chip__mood-icon" />
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
      <p id={`${id}-note-help`} className="supporting-note diary-form__count">
        {t("diary.noteCount", { count: value.note.length, max: MAX_NOTE_LENGTH })}
      </p>
      <p className="diary-form__status" role="status">
        {status === "saved" ? (
          <>
            <AppIcon icon={Check} className="text-action__icon" />
            {t("diary.saved")}
          </>
        ) : undoable ? (
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
    </div>
  );
}
