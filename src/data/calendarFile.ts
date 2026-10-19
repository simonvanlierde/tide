import type { ExpectedCycle } from "../domain/cycle";
import type { IsoDate } from "../domain/types";
import { addDays } from "../utils/date";
import { downloadText } from "./transfer";

// UIDs carry the cycle's id, so importing a newer file moves an event to its
// new date instead of adding a second one.
const UID_DOMAIN = "tide.duinlab.nl";

interface CalendarWords {
  period: string;
  fertile: string;
  /** Description on fertile-window events. */
  disclaimer: string;
}

interface CalendarOptions {
  today: IsoDate;
  fertility: boolean;
  words: CalendarWords;
  now: Date;
}

const icsDate = (day: IsoDate) => day.replaceAll("-", "");

// RFC 5545 3.3.11: backslash, semicolon, comma and newline are escaped in TEXT.
const escapeText = (text: string) =>
  text.replace(/[\\;,]/g, "\\$&").replace(/\n/g, "\\n");

// RFC 5545 3.1: a line longer than 75 octets continues after CRLF and one
// space. Counted in UTF-8 bytes, and never splits a character.
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  let folded = "";
  let width = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (width + size > 75) {
      folded += "\r\n ";
      width = 1;
    }
    folded += char;
    width += size;
  }
  return folded;
}

// An all-day event from `first` through `last`; DTEND is exclusive.
function event(
  uid: string,
  first: IsoDate,
  last: IsoDate,
  summary: string,
  stamp: string,
  sequence: number,
  description?: string,
) {
  return [
    "BEGIN:VEVENT",
    `UID:${uid}@${UID_DOMAIN}`,
    `DTSTAMP:${stamp}`,
    `SEQUENCE:${sequence}`,
    `DTSTART;VALUE=DATE:${icsDate(first)}`,
    `DTEND;VALUE=DATE:${icsDate(addDays(last, 1))}`,
    `SUMMARY:${escapeText(summary)}`,
    ...(description ? [`DESCRIPTION:${escapeText(description)}`] : []),
    // Shared calendars show only "busy" or nothing, and an estimate
    // shouldn't mark the day as busy at all.
    "CLASS:PRIVATE",
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
  ];
}

export function buildCalendar(
  cycles: ExpectedCycle[],
  { today, fertility, words, now }: CalendarOptions,
): string {
  const stamp = `${now.toISOString().slice(0, 19).replace(/[-:]/g, "")}Z`;
  // Rises with every export, so a calendar takes the newer copy of an event.
  const sequence = Math.floor(now.getTime() / 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tide//Expected periods//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const cycle of cycles) {
    lines.push(
      ...event(
        `period-${cycle.id}`,
        cycle.periodStart,
        cycle.periodStart,
        words.period,
        stamp,
        sequence,
      ),
    );
    // A window already over has nothing left to plan around.
    if (fertility && cycle.fertileTo >= today) {
      lines.push(
        ...event(
          `fertile-${cycle.id}`,
          cycle.fertileFrom,
          cycle.fertileTo,
          words.fertile,
          stamp,
          sequence,
          words.disclaimer,
        ),
      );
    }
  }
  lines.push("END:VCALENDAR");
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}

export function downloadCalendar(
  cycles: ExpectedCycle[],
  options: CalendarOptions,
) {
  downloadText(
    buildCalendar(cycles, options),
    `tide-expected-periods-${options.today}.ics`,
    "text/calendar",
  );
}
