import { useId } from "react";
import type { ForecastExplanation } from "../../domain/cycle";
import type { IsoDate } from "../../domain/types";
import { useLocale, useT } from "../../state/provider";
import { formatShortDate } from "../../utils/date";
import { explainTranslators } from "./explainMessages";

interface ForecastExplainerProps {
  explanation: ForecastExplanation;
}

// The actual inputs behind the next-period date, step by step, as a section of
// the Cycle insights sheet. Every number comes from explainForecast; this only
// words them. Its own chunk, so the words stay out of the main bundle.
export function ForecastExplainer({ explanation: e }: ForecastExplainerProps) {
  const titleId = useId();
  const t = useT();
  const locale = useLocale();
  const date = (day: IsoDate) => formatShortDate(day, locale);
  const num = (n: number) => n.toLocaleString(locale);
  const i18n = explainTranslators[locale];
  const x = (key: string, vars: Record<string, string | number> = {}) =>
    // A date abbreviated with a dot ("Apr." in German) can end a sentence.
    i18n._(key, vars).replaceAll("..", ".");

  const f = e.fertility;

  return (
    <section className="insights__sums" aria-labelledby={titleId}>
      <h3 id={titleId} className="cycle-history__title">
        {t("today.howWorkedOut")}
      </h3>
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
            ? x("explain.range", {
                count: e.spreadDays ?? 0,
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
              {f.widening > 0 ? ` ${x("explain.widened", { n: f.widening })}` : null} {t("today.notBirthControl")}
            </li>
          </>
        ) : null}
      </ol>
    </section>
  );
}
