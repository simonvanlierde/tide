import type { IsoDate } from "../../src/domain/types";
import { addDays } from "../../src/utils/date";

// One-day periods whose starts are `lengths` apart, the last on `lastStart`:
// a history with exactly these completed cycle lengths.
export function startsEndingOn(lastStart: IsoDate, lengths: number[]) {
  const starts: IsoDate[] = [lastStart];
  for (const length of [...lengths].reverse()) {
    starts.unshift(addDays(starts[0] as IsoDate, -length));
  }
  return starts;
}
