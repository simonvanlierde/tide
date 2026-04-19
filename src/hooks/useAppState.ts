import { useEffect, useMemo, useState } from "react";
import { buildCycleSummary, getCompletedCycleLengths } from "../domain/cycle";
import type { AppState, IsoDate } from "../domain/types";
import { loadAppState, saveAppState } from "../data/storage";
import { addDays } from "../utils/date";

function sortPeriodDays(periodDays: IsoDate[]) {
  return [...periodDays].sort();
}

export function useAppState(today: IsoDate) {
  const [state, setState] = useState<AppState>(() => loadAppState());

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const summary = useMemo(
    () =>
      buildCycleSummary({
        today,
        periodDays: state.periodDays,
        completedCycleLengths: getCompletedCycleLengths(state.periodDays)
      }),
    [state.periodDays, today]
  );

  function toggleTodayPeriodDay() {
    setState((currentState) => {
      const hasTodayLogged = currentState.periodDays.includes(today);
      const periodDays = hasTodayLogged
        ? currentState.periodDays.filter((value) => value !== today)
        : sortPeriodDays([...currentState.periodDays, today]);

      return {
        ...currentState,
        periodDays
      };
    });
  }

  function snoozeReminders(days: number) {
    setState((currentState) => ({
      ...currentState,
      settings: {
        ...currentState.settings,
        snoozedUntil: addDays(today, days)
      }
    }));
  }

  return {
    state,
    summary,
    toggleTodayPeriodDay,
    snoozeReminders
  };
}
