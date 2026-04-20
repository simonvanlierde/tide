import { exportBackup, importBackup } from "../data/exportImport";
import { buildCycleSummary, getCompletedCycleLengths } from "../domain/cycle";
import type { HomeDisplayMode, IsoDate } from "../domain/types";
import { getTodayIsoDate } from "../utils/date";
import { useAppStateContext } from "./provider";

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
  const { state, dispatch } = useAppStateContext();

  const summary = buildCycleSummary({
    today,
    periodDays: state.periodDays,
    completedCycleLengths: getCompletedCycleLengths(state.periodDays),
  });

  function toggleTodayPeriodDay() {
    dispatch({ type: "togglePeriodDay", day: today });
  }

  function togglePeriodDay(day: IsoDate) {
    dispatch({ type: "togglePeriodDay", day });
  }

  function snoozeReminders(days: number) {
    dispatch({ type: "snoozeReminders", today, days });
  }

  function clearReminderSnooze() {
    dispatch({ type: "clearReminderSnooze" });
  }

  function setReminderWindowDays(days: number) {
    dispatch({ type: "setReminderWindowDays", days });
  }

  function setHomeDisplayMode(mode: HomeDisplayMode) {
    dispatch({ type: "setHomeDisplayMode", mode });
  }

  function exportState() {
    return exportBackup(state);
  }

  async function importState(file: File) {
    const payload = await readBackupFile(file);
    const nextState = importBackup(payload);
    dispatch({ type: "replaceState", state: nextState });
    return nextState;
  }

  return {
    state,
    summary,
    toggleTodayPeriodDay,
    togglePeriodDay,
    snoozeReminders,
    clearReminderSnooze,
    setReminderWindowDays,
    setHomeDisplayMode,
    exportState,
    importState,
  };
}
