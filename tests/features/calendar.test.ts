import { describe, expect, it } from "vitest";
import { forecast } from "../../src/domain/cycle";
import type { IsoDate, LoggedFlow } from "../../src/domain/types";
import {
  buildCalendarCells,
  buildMonthDays,
} from "../../src/features/calendar/calendar";

describe("calendar helpers", () => {
  it("builds a full month grid with adjacent-month days and future metadata", () => {
    const days = buildMonthDays("2026-04-18", "2026-04-21");

    expect(days).toHaveLength(35);
    expect(days[0]).toMatchObject({
      value: "2026-03-30",
      isOutsideMonth: true,
      isFuture: false,
      isToday: false,
    });
    expect(days[22]).toMatchObject({
      value: "2026-04-21",
      isOutsideMonth: false,
      isFuture: false,
      isToday: true,
    });
    expect(days[23]).toMatchObject({
      value: "2026-04-22",
      isOutsideMonth: false,
      isFuture: true,
      isToday: false,
    });
  });

  it("keeps six rows when a month needs trailing week coverage", () => {
    const days = buildMonthDays("2026-08-15", "2026-08-21");

    expect(days).toHaveLength(42);
    expect(days[41]).toMatchObject({
      value: "2026-09-06",
      isOutsideMonth: true,
    });
  });

  it("builds the grid for a year below 100 without shifting it to 19xx", () => {
    const days = buildMonthDays("0099-03-10", "2026-04-21");

    expect(days[0]).toMatchObject({
      value: "0099-02-23",
      isOutsideMonth: true,
    });
    expect(days[6]).toMatchObject({
      value: "0099-03-01",
      isOutsideMonth: false,
    });
    expect(days).toHaveLength(42);
  });

  // One completed 28-day cycle of 4-day periods (see forecast.test.ts): the
  // past window centres on 03-17, the current one on 04-14, and the next
  // period starts 04-28.
  const intensityByDay: Record<IsoDate, LoggedFlow> = {
    "2026-03-31": "heavy",
    "2026-04-01": null,
  };
  const learned = (fertility: boolean) =>
    forecast({
      fertility,
      today: "2026-04-09",
      periodDays: [
        "2026-03-03",
        "2026-03-04",
        "2026-03-05",
        "2026-03-06",
        "2026-03-31",
        "2026-04-01",
        "2026-04-02",
        "2026-04-03",
      ],
    });
  function cells(month: IsoDate, showFertility: boolean, numbers = true) {
    const all = buildCalendarCells(
      buildMonthDays(month, "2026-04-09"),
      learned(showFertility),
      intensityByDay,
      numbers,
    );
    return (date: IsoDate) => all.find((cell) => cell.value === date);
  }

  it("shows the forecast's estimates on days that aren't logged", () => {
    const cell = cells("2026-04-01", true);

    expect(cell("2026-04-09")?.estimate).toBe("fertile");
    expect(cell("2026-04-14")?.estimate).toBe("ovulation");
    expect(cell("2026-04-28")?.estimate).toBe("predicted-period");
  });

  it("omits retrospective fertile windows when fertility is hidden", () => {
    const cell = cells("2026-03-01", false);

    expect(cell("2026-03-12")?.estimate).toBeNull();
    expect(cell("2026-03-17")?.estimate).toBeNull();
  });

  it("drops fertility markers but keeps the expected period when hidden", () => {
    const cell = cells("2026-04-01", false);

    expect(cell("2026-04-14")?.estimate).toBeNull();
    expect(cell("2026-04-09")?.estimate).toBeNull();
    expect(cell("2026-04-28")?.estimate).toBe("predicted-period");
  });

  it("shows a logged day's flow instead of its estimate or number", () => {
    const cell = cells("2026-04-01", true);

    expect(cell("2026-03-31")).toMatchObject({
      isLogged: true,
      flow: "heavy",
      estimate: null,
      cycleDay: null,
    });
    // Logged without a level: still logged, with no flow claimed.
    expect(cell("2026-04-01")).toMatchObject({ isLogged: true, flow: null });
    expect(cell("2026-04-02")).toMatchObject({ isLogged: false, cycleDay: 3 });
  });

  it("numbers only days that have happened, and only when asked", () => {
    expect(cells("2026-04-01", true)("2026-04-09")?.cycleDay).toBe(10);
    expect(cells("2026-04-01", true)("2026-04-10")?.cycleDay).toBeNull();
    expect(cells("2026-04-01", true, false)("2026-04-09")?.cycleDay).toBeNull();
  });
});
