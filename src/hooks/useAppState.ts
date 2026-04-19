import { useEffect, useMemo, useState } from "react";
import { buildCycleSummary, getCompletedCycleLengths } from "../domain/cycle";
import type { AppState, IsoDate } from "../domain/types";
import { importBackup } from "../data/exportImport";
import { loadAppState, saveAppState } from "../data/storage";
import { addDays, getTodayIsoDate } from "../utils/date";

function sortPeriodDays(periodDays: IsoDate[]) {
  return [...periodDays].sort();
}

async function readBackupFile(file: File) {
  if (typeof file.text === "function") {
    return file.text();
  }

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Could not read backup file"));
    };

    reader.onerror = () => {
      reject(new Error("Could not read backup file"));
    };

    reader.readAsText(file);
  });
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

  function setReminderWindowDays(days: number) {
    setState((currentState) => ({
      ...currentState,
      settings: {
        ...currentState.settings,
        reminderWindowDays: days
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
    const payload = await readBackupFile(file);
    const nextState = importBackup(payload);
    setState(nextState);
    return nextState;
  }

  return {
    state,
    summary,
    toggleTodayPeriodDay,
    snoozeReminders,
    setReminderWindowDays,
    removePeriodDay,
    exportState,
    importState
  };
}
