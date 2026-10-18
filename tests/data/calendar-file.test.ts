import { describe, expect, it } from "vitest";
import { buildCalendar, foldLine } from "../../src/data/calendarFile";
import type { ExpectedCycle } from "../../src/domain/cycle";

const CYCLES: ExpectedCycle[] = [
  {
    number: 4,
    periodStart: "2026-04-29",
    ovulation: "2026-04-15",
    fertileFrom: "2026-04-10",
    fertileTo: "2026-04-16",
  },
  {
    number: 5,
    periodStart: "2026-05-27",
    ovulation: "2026-05-13",
    fertileFrom: "2026-05-08",
    fertileTo: "2026-05-14",
  },
];

const WORDS = {
  period: "Expected period",
  fertile: "Fertile window",
  disclaimer: "For information only; not birth control.",
};

const NOW = new Date("2026-04-20T09:30:15.123Z");

function build(fertility: boolean, today = "2026-04-20" as const) {
  return buildCalendar(CYCLES, { today, fertility, words: WORDS, now: NOW });
}

describe("buildCalendar", () => {
  it("writes one all-day event per expected period start, CRLF throughout", () => {
    const ics = build(false);

    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics.replaceAll("\r\n", "")).not.toMatch(/[\r\n]/);
    expect(ics.split("\r\n").slice(0, 5)).toEqual([
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Tide//Expected periods//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ]);
    expect(ics).toContain(
      [
        "BEGIN:VEVENT",
        "UID:period-4@tide.duinlab.nl",
        "DTSTAMP:20260420T093015Z",
        `SEQUENCE:${Math.floor(NOW.getTime() / 60_000)}`,
        "DTSTART;VALUE=DATE:20260429",
        "DTEND;VALUE=DATE:20260430",
        "SUMMARY:Expected period",
        "CLASS:PRIVATE",
        "TRANSP:TRANSPARENT",
        "END:VEVENT",
      ].join("\r\n"),
    );
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).not.toContain("fertile");
  });

  it("keeps the same UIDs from one export to the next", () => {
    const later = buildCalendar(CYCLES, {
      today: "2026-04-22",
      fertility: false,
      words: WORDS,
      now: new Date("2026-04-22T10:00:00Z"),
    });
    const uids = (ics: string) => ics.match(/^UID:.*$/gm);

    expect(uids(later)).toEqual(uids(build(false)));
  });

  it("adds fertile windows only when asked, skipping one that is over", () => {
    const ics = build(true);

    expect(ics).toContain(
      [
        "UID:fertile-5@tide.duinlab.nl",
        "DTSTAMP:20260420T093015Z",
        `SEQUENCE:${Math.floor(NOW.getTime() / 60_000)}`,
        "DTSTART;VALUE=DATE:20260508",
        "DTEND;VALUE=DATE:20260515",
        "SUMMARY:Fertile window",
        "DESCRIPTION:For information only\\; not birth control.",
      ].join("\r\n"),
    );
    // The first window ended on 04-16, before today.
    expect(ics).not.toContain("fertile-4");
  });

  it("escapes commas and backslashes in text", () => {
    const ics = buildCalendar(CYCLES.slice(0, 1), {
      today: "2026-04-20",
      fertility: false,
      words: { ...WORDS, period: "Période, prévue \\ estimée" },
      now: NOW,
    });

    expect(ics).toContain("SUMMARY:Période\\, prévue \\\\ estimée");
  });
});

describe("foldLine", () => {
  it("leaves a line of 75 octets alone", () => {
    const line = "x".repeat(75);
    expect(foldLine(line)).toBe(line);
  });

  it("folds at 75 octets with CRLF and a space, never inside a character", () => {
    const line = `SUMMARY:${"é".repeat(60)}`;
    const folded = foldLine(line);
    const parts = folded.split("\r\n");
    const bytes = (text: string) => new TextEncoder().encode(text).length;

    expect(parts.length).toBeGreaterThan(1);
    for (const part of parts) {
      expect(bytes(part)).toBeLessThanOrEqual(75);
    }
    for (const part of parts.slice(1)) {
      expect(part.startsWith(" ")).toBe(true);
    }
    // Unfolding gives the original line back.
    expect(folded.replaceAll("\r\n ", "")).toBe(line);
  });
});
