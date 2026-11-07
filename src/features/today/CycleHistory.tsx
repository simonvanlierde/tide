import { useId } from "react";
import { getCycleHistory } from "../../domain/cycle";
import { getPredictionDays } from "../../domain/flow";
import type { IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions, useIsReadOnly, useLocale, useT } from "../../state/provider";
import { formatLongDate, formatShortDate } from "../../utils/date";
import "../../styles/cycle-history.css";

export function CycleHistory({ today }: { today: IsoDate }) {
  const state = useAppState();
  const actions = useAppStateActions();
  const readOnly = useIsReadOnly();
  const locale = useLocale();
  const t = useT();
  const titleId = useId();
  const helpId = useId();
  const history = getCycleHistory(
    getPredictionDays(state.intensityByDay).filter((day) => day <= today),
    state.incompleteCycleStarts,
  ).slice(-12);
  const first = history[0];
  const last = history.at(-1);
  const maximum = Math.max(1, ...history.map((cycle) => cycle.length));

  return (
    <section className="cycle-history" aria-labelledby={titleId}>
      <h3 id={titleId} className="cycle-history__title">
        {t("history.title")}
      </h3>
      {first && last ? (
        <>
          <p>{t("history.description", { n: history.length })}</p>
          <div className="cycle-history__chart" aria-hidden="true">
            <span>{t("history.days")}</span>
            <div className="cycle-history__plot">
              <div className="cycle-history__scale">
                <span>{maximum}</span>
                <span>0</span>
              </div>
              <svg viewBox="0 0 360 160" focusable="false" aria-hidden="true">
                <path className="cycle-history__axis" d="M 0 10 V 150 H 360" />
                {history.map((cycle, index) => {
                  const x = history.length === 1 ? 180 : 12 + index * (336 / (history.length - 1));
                  const y = 150 - (cycle.length / maximum) * 136;
                  return cycle.incomplete ? (
                    <path
                      key={cycle.start}
                      className="cycle-history__excluded"
                      d={`M ${x - 5} ${y - 5} l 10 10 m -10 0 l 10 -10`}
                    />
                  ) : (
                    <circle key={cycle.start} className="cycle-history__point" cx={x} cy={y} r="5" />
                  );
                })}
              </svg>
            </div>
            <div className="cycle-history__dates">
              <span>{formatShortDate(first.start, locale)}</span>
              {history.length > 1 ? <span>{formatShortDate(last.start, locale)}</span> : null}
            </div>
            <p className="cycle-history__axis-label">{t("history.chartDates")}</p>
            {history.some((cycle) => cycle.incomplete) ? (
              <p className="cycle-history__legend">
                <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
                  <path className="cycle-history__excluded" d="M 3 3 l 10 10 m -10 0 l 10 -10" />
                </svg>
                {t("history.excluded")}
              </p>
            ) : null}
          </div>
          <p id={helpId}>{t("history.help")}</p>
          <table className="cycle-history__table" aria-labelledby={titleId}>
            <thead>
              <tr>
                <th scope="col">{t("history.start")}</th>
                <th scope="col">
                  {t("history.length")} ({t("common.days")})
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((cycle) => (
                <tr key={cycle.start}>
                  <th scope="row">
                    <time dateTime={cycle.start}>{formatLongDate(cycle.start, locale)}</time>
                    <label className="cycle-history__check">
                      <input
                        type="checkbox"
                        checked={cycle.incomplete}
                        disabled={readOnly}
                        aria-label={t("history.incompleteFor", { date: formatLongDate(cycle.start, locale) })}
                        aria-describedby={helpId}
                        onChange={() => actions.toggleIncompleteCycle(cycle.start, today)}
                      />
                      <span>{t("history.incomplete")}</span>
                    </label>
                  </th>
                  <td>{cycle.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>{t("history.empty")}</p>
      )}
    </section>
  );
}
