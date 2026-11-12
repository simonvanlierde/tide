import { useEffect, useReducer, useState } from "react";
import type { IsoDate } from "../domain/types";
import { getTodayIsoDate } from "../utils/date";

// Today's local date, kept current while the app stays open. A phone resumes a
// backgrounded PWA without reloading it, so without this a "log today" tap the
// next morning would still log yesterday.
export function useToday(): IsoDate {
  const [today, setToday] = useState(getTodayIsoDate);
  // Bumped by every timer firing. A firing just before midnight by the wall
  // clock (it stepped back) leaves the date unchanged, and must still re-arm.
  const [firings, fired] = useReducer((count: number) => count + 1, 0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new day or a firing re-arms the timer for the next midnight.
  useEffect(() => {
    const refresh = () => setToday(getTodayIsoDate());
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    // Timers pause while the page is hidden, so also re-read on return.
    const timer = setTimeout(() => {
      refresh();
      fired();
    }, nextMidnight.getTime() - now.getTime());
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [today, firings]);

  return today;
}
