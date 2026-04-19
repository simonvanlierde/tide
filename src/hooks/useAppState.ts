import { useEffect, useMemo, useState } from "react";
import { buildCycleSummary, getCompletedCycleLengths } from "../domain/cycle";
import type { AppState, IsoDate } from "../domain/types";
import { importBackup } from "../data/exportImport";
import { loadAppState, saveAppState } from "../data/storage";
import { addDays, getTodayIsoDate } from "../utils/date";

function sortPeriodDays(periodDays: IsoDate[]) {
  return [...periodDays].sort();
}

export function useAppState(today: IsoDate = getTodayIsoDate()) {
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

  function removePeriodDay(day: IsoDate) {
    setState((currentState) => ({
      ...currentState,
      periodDays: currentState.periodDays.filter((value) => value !== day)
    }));
  }

  function exportState() {
    return JSON.stringify(state, null, 2);
  }

  async function importState(file: File) {
    const payload = await file.text();
    const nextState = importBackup(payload);
    setState(nextState);
    return nextState;
  }

  return {
    state,
    summary,
    toggleTodayPeriodDay,
    snoozeReminders,
    removePeriodDay,
    exportState,
    importState
  };
}
