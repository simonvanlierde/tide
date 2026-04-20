import type { HomeDisplayMode, IsoDate } from "../domain/types";

export type AppStateAction =
  | { type: "replaceState"; state: unknown }
  | { type: "togglePeriodDay"; day: IsoDate }
  | { type: "setReminderWindowDays"; days: number }
  | { type: "snoozeReminders"; today: IsoDate; days: number }
  | { type: "clearReminderSnooze" }
  | { type: "setHomeDisplayMode"; mode: HomeDisplayMode };
