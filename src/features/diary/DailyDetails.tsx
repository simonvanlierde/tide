import { NotebookPen } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { isIsoDate } from "../../data/schema";
import { type DailyDetails as Details, MAX_NOTE_LENGTH, MOODS, SYMPTOMS } from "../../domain/diary";
import type { IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions, useIsReadOnly, useLocale, useT } from "../../state/provider";
import { formatLongDate, formatShortDate } from "../../utils/date";
import "./diary.css";

const EMPTY: Details = { symptoms: null, mood: null, note: "" };
const sameDetails = (a: Details, b: Details) => JSON.stringify(a) === JSON.stringify(b);

// `day` is the day the trigger opens, named in its label (the Calendar's
// selected day). Without it the trigger opens today and needs no date.
export function DailyDetails({ today, day: target, month }: { today: IsoDate; day?: IsoDate; month?: IsoDate }) {
  const state = useAppState();
  const t = useT();
  const locale = useLocale();
  const [day, setDay] = useState(today);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const entries = month
    ? Object.keys(state.detailsByDay)
        .filter((date) => date.startsWith(month.slice(0, 7)))
        .sort()
        .reverse()
    : [];

  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }

  return (
    <div className="daily-details">
      <button
        ref={trigger}
        type="button"
        className={target ? "calendar__action daily-details__trigger" : "text-action daily-details__trigger"}
        disabled={open}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setDay(target ?? today);
          setOpen(true);
        }}
      >
        {target ? <NotebookPen aria-hidden="true" size={18} strokeWidth={1.8} /> : null}
        {target
          ? t(state.detailsByDay[target] ? "diary.editDetailsFor" : "diary.addDetailsFor", {
              date: formatShortDate(target, locale),
            })
          : t(state.detailsByDay[today] ? "diary.editDetails" : "diary.addDetails")}
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

function DetailsForm({
  day,
  today,
  onDayChange,
  onClose,
}: {
  day: IsoDate;
  today: IsoDate;
  onDayChange: (day: IsoDate) => void;
  onClose: () => void;
}) {
  const state = useAppState();
  const actions = useAppStateActions();
  const readOnly = useIsReadOnly();
  const t = useT();
  const id = useId();
  const dateInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    dateInput.current?.focus();
  }, []);
  const value = state.detailsByDay[day] ?? EMPTY;
  const [original, setOriginal] = useState(value);
  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState(false);
  const [draftDay, setDraftDay] = useState(day);
  if (draftDay !== day) {
    setDraftDay(day);
    setOriginal(value);
    setDraft(value);
    setSaved(false);
  }
  const dirty = !sameDetails(draft, original);
  const conflict = !sameDetails(value, original);

  function change(next: Details) {
    setDraft(next);
    setSaved(false);
  }

  return (
    <form
      className="diary-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (readOnly || conflict || day > today) return;
        actions.setDayDetails(day, draft, today);
        setOriginal(draft);
        setSaved(true);
      }}
    >
      <p className="supporting-note">{t("diary.saveHelp")}</p>
      <label className="diary-form__field" htmlFor={`${id}-date`}>
        {t("diary.date")}
        <input
          ref={dateInput}
          id={`${id}-date`}
          type="date"
          value={day}
          max={today}
          required
          disabled={dirty}
          aria-describedby={dirty ? `${id}-date-help` : undefined}
          onChange={(event) => {
            if (isIsoDate(event.target.value) && event.target.value <= today) onDayChange(event.target.value);
          }}
        />
      </label>
      {dirty ? (
        <p id={`${id}-date-help`} className="supporting-note">
          {t("diary.finishEditing")}
        </p>
      ) : null}
      {conflict ? (
        <p className="supporting-note" role="alert">
          {t("diary.conflict")}
        </p>
      ) : null}
      <fieldset className="diary-form__fields" disabled={readOnly || conflict}>
        <fieldset className="diary-form__symptoms" aria-describedby={`${id}-symptom-help`}>
          <legend>{t("diary.symptoms")}</legend>
          <p id={`${id}-symptom-help`} className="supporting-note">
            {t("diary.symptomsHelp")}
          </p>
          <div className="diary-form__choices">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={draft.symptoms?.length === 0}
                onChange={(event) => change({ ...draft, symptoms: event.target.checked ? [] : null })}
              />
              {t("diary.noSymptoms")}
            </label>
            {SYMPTOMS.map((symptom) => (
              <label key={symptom} className="checkbox-row">
                <input
                  type="checkbox"
                  checked={draft.symptoms?.includes(symptom) ?? false}
                  onChange={(event) => {
                    const symptoms = event.target.checked
                      ? [...(draft.symptoms ?? []), symptom]
                      : (draft.symptoms ?? []).filter((entry) => entry !== symptom);
                    change({ ...draft, symptoms: symptoms.length ? symptoms : null });
                  }}
                />
                {t(`diary.symptom.${symptom}`)}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="diary-form__field" htmlFor={`${id}-mood`}>
          {t("diary.mood")}
          <select
            id={`${id}-mood`}
            value={draft.mood ?? ""}
            onChange={(event) =>
              change({ ...draft, mood: event.target.value ? (event.target.value as Details["mood"]) : null })
            }
          >
            <option value="">{t("diary.moodUnlogged")}</option>
            {MOODS.map((mood) => (
              <option key={mood} value={mood}>
                {t(`diary.mood.${mood}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="diary-form__field" htmlFor={`${id}-note`}>
          {t("diary.note")}
          <textarea
            id={`${id}-note`}
            rows={3}
            maxLength={MAX_NOTE_LENGTH}
            value={draft.note}
            aria-describedby={`${id}-note-help`}
            onChange={(event) => change({ ...draft, note: event.target.value })}
          />
        </label>
        <p id={`${id}-note-help`} className="supporting-note">
          {t("diary.noteHint", { max: MAX_NOTE_LENGTH })}
        </p>
        <div className="diary-form__actions">
          <button type="submit" className="commit-action">
            {t("diary.save")}
          </button>
          <button type="button" className="text-action" onClick={() => change(EMPTY)}>
            {t("diary.clear")}
          </button>
        </div>
      </fieldset>
      <button type="button" className="text-action" onClick={onClose}>
        {t("diary.cancel")}
      </button>
      {saved ? (
        <p className="supporting-note" role="status">
          {t(sameDetails(draft, EMPTY) ? "diary.removed" : "diary.saved")}
        </p>
      ) : null}
    </form>
  );
}
