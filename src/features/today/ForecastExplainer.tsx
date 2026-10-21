import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ForecastExplanation } from "../../domain/cycle";
import type { IsoDate } from "../../domain/types";
import { interpolate, plural } from "../../i18n";
import { useLocale, useT } from "../../state/provider";
import { formatShortDate } from "../../utils/date";
import { EXPLAIN_MESSAGES } from "./explainMessages";

interface ForecastExplainerProps {
  explanation: ForecastExplanation;
  onClose: () => void;
}

// The actual inputs behind the next-period date, step by step. Every number
// comes from explainForecast; this only words them. Same native-dialog
// handling as CycleInsights.
export function ForecastExplainer({ explanation: e, onClose }: ForecastExplainerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const t = useT();
  const locale = useLocale();
  const date = (day: IsoDate) => formatShortDate(day, locale);
  const num = (n: number) => n.toLocaleString(locale);
  const messages = EXPLAIN_MESSAGES[locale];
  const x = (key: keyof typeof messages, vars: Record<string, string | number> = {}) =>
    // A date abbreviated with a dot ("Apr." in German) can end a sentence.
    interpolate(messages[key], vars).replaceAll("..", ".");

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const requestClose = () => dialogRef.current?.close();
  const f = e.fertility;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Esc closes the dialog for keyboard users, this click only dismisses on the backdrop
    <dialog
      ref={dialogRef}
      className="insights"
      aria-labelledby="explain-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          requestClose();
        }
      }}
    >
      <div className="insights__head">
        <h2 id="explain-title" className="insights__title">
          {t("today.howWorkedOut")}
        </h2>
        <button type="button" className="icon-close" aria-label={t("common.close")} onClick={requestClose}>
          <X aria-hidden="true" size={18} />
        </button>
      </div>
      <ol className="insights__how-list">
        {e.median === null ? (
          <li>{x("explain.fallback", { cycle: e.cycleLength })}</li>
        ) : (
          <>
            <li>{x("explain.cycles", { list: e.cycleLengths.join(", ") })}</li>
            <li>
              {e.median === e.cycleLength
                ? x("explain.median", { cycle: e.cycleLength })
                : x("explain.medianRounded", {
                    median: num(e.median),
                    cycle: e.cycleLength,
                  })}
            </li>
          </>
        )}
        <li>
          {x("explain.next", {
            start: date(e.lastStart),
            cycle: e.cycleLength,
            date: date(e.nextPeriod),
          })}
        </li>
        <li>
          {e.range
            ? x(plural("explain.range", e.spreadDays ?? 0, locale), {
                spread: num(e.spreadDays ?? 0),
                from: date(e.range.from),
                to: date(e.range.to),
              })
            : x(e.spreadDays === null ? "explain.noRange" : "explain.sameLength")}
        </li>
        {f ? (
          <>
            <li>
              {x("explain.ovulation", {
                luteal: f.lutealDays,
                date: date(f.ovulation),
              })}
            </li>
            <li>
              {x("explain.fertile", {
                before: f.daysBefore,
                after: f.daysAfter,
                from: date(f.from),
                to: date(f.to),
              })}
              {f.widening > 0 ? ` ${x(plural("explain.widened", f.widening, locale), { n: f.widening })}` : null}{" "}
              {t("today.notBirthControl")}.
            </li>
          </>
        ) : null}
      </ol>
    </dialog>
  );
}
