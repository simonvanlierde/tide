// The base dictionary and single source of truth for message keys. Every other
// language is a file shaped exactly like this one; `Dictionary` forces new
// languages to cover the same keys, and `MessageKey` gives call sites full
// autocomplete + typo-checking. Keys ending in `.one`/`.other` are plural forms
// selected by plural() (see index.ts).
export const en = {
  // Navigation & app shell
  "nav.today": "Today",
  "nav.calendar": "Calendar",
  "nav.settings": "Settings",
  "app.skipToContent": "Skip to content",
  "app.primaryNav": "Primary navigation",
  "app.newerData":
    "A newer version of Tide saved your data. Reload to update; changes made here are not saved.",

  // Today screen
  "today.srCycleDay": "Cycle day {day}, {phase}",
  "today.nextPeriod": "Next period",
  "today.fertility": "Fertility",
  "today.fertilityInfoLabel": "How fertility is estimated",
  "today.cycleInsights": "Cycle insights",
  "today.howWorkedOut": "How was this worked out?",
  "today.explainError": "This couldn't be opened. Reload Tide and try again.",
  "today.daysAgo.one": "{n} day ago",
  "today.daysAgo.other": "{n} days ago",
  "today.expectedToday": "Expected today",
  "today.inDays.one": "In {n} day",
  "today.inDays.other": "In {n} days",
  "today.higherToday": "In the fertile window (estimate)",
  "today.lowerToday": "Outside the fertile window (estimate)",
  "today.notBirthControl": "Not birth control",
  "fertilityAsk.title": "Show fertility estimates?",
  "fertilityAsk.body":
    "Tide can mark the days you are most likely to be fertile, worked out from the periods you log. It is an estimate, not birth control. You can change this in Settings.",
  "fertilityAsk.show": "Show",
  "fertilityAsk.hide": "Don't show",
  "today.privacy": "Stored only on this device.",
  "today.importPrompt": "Have a Tide backup, or history in Clue or Flo?",
  "today.importLink": "Import it",
  "today.fertilityUnclear": "Unclear while late",
  "today.periodLate": "Period",
  "today.daysLate.one": "{n} day late",
  "today.daysLate.other": "{n} days late",
  "today.expectedOn": "Expected {date}",
  "today.ovulationDaysAgo.one": "Ovulation {n} day ago",
  "today.ovulationDaysAgo.other": "Ovulation {n} days ago",
  "today.ovulationToday": "Ovulation today",
  "today.ovulationInDays.one": "Ovulation in {n} day",
  "today.ovulationInDays.other": "Ovulation in {n} days",
  "today.learningFallback":
    "Using a typical 28-day cycle until we learn your pattern.",
  "today.learningInsufficient": "Log your period to see a forecast.",

  // Cycle phases: word form (heading) and line form ("X phase")
  "phase.menstrual": "Menstrual",
  "phase.follicular": "Follicular",
  "phase.ovulation": "Ovulation",
  "phase.luteal": "Luteal",
  "phase.learning": "Learning",
  "phase.between": "Between periods",
  "phaseLine.menstrual": "Menstrual phase",
  "phaseLine.follicular": "Follicular phase",
  "phaseLine.ovulation": "Ovulation phase",
  "phaseLine.luteal": "Luteal phase",
  "phaseLine.learning": "Learning",
  "phaseLine.between": "Between periods",
  "phaseLine.late": "Period expected",

  // Cycle dial + segment status (shown in the dial centre and read aloud)
  "dial.overview": "Cycle overview",
  "dial.days": "Cycle days",
  "dial.cycleDay": "Cycle day",
  "dial.day": "Day {n}",
  "status.period": "Period",
  "status.ovulationExpected": "Ovulation expected",
  "status.fertileWindow": "Fertile window",
  "status.periodExpected": "Period expected",

  // Cycle insights dialog
  "insights.title": "Cycle insights",
  "insights.cycleLength": "Cycle length",
  "insights.periodLength": "Period length",
  "insights.cyclesTracked": "Cycles tracked",
  "insights.basedOn":
    "Based on a typical {cycle}-day cycle until you’ve logged a full cycle.",
  "insights.regularity": "Cycle regularity",
  "insights.regularityAria": "Cycle regularity: {label}",
  "regularity.none": "Not enough data yet",
  "regularity.veryRegular": "Very regular",
  "regularity.regular": "Regular",
  "regularity.somewhatVariable": "Somewhat variable",
  "regularity.variable": "Variable",
  "insights.how": "How predictions work",
  "insights.how1":
    "Everything is worked out on your device from the days you log.",
  "insights.howCycleStart":
    "A gap of {gap} days or more between logged days starts a new cycle; shorter gaps are the same period.",
  "insights.how2":
    "Cycle length is the median of your last {recent} cycles, so one odd month doesn’t throw it off. Before two cycles, a typical {cycle}-day cycle is used.",
  "insights.how3":
    "Period length is your recent average, kept to a normal {min}–{max} days.",
  "insights.how4":
    "Your next period is your last start plus that cycle length; ovulation is estimated {luteal} days before it.",
  "insights.howNextPeriod":
    "Your next period is your last start plus that cycle length.",
  "insights.how5":
    "The fertile window runs {before} days before to {after} day after ovulation, and widens when your cycles vary more.",

  // Marker legend, shared by the Today dial and the calendar
  "legend.period": "Period",
  "legend.expected": "Expected period",
  "legend.fertileWindow": "Fertile window",
  "legend.ovulation": "Ovulation",

  // Flow gauge
  "flow.legend": "Flow",
  "flow.spotting": "Spotting",
  "flow.light": "Light",
  "flow.medium": "Medium",
  "flow.heavy": "Heavy",

  // Log action + reminder
  "log.remove": "Remove bleeding log",
  "log.logged": "Logged today",
  "log.loggedWith": "Logged today · {flow}",
  "log.add": "Log bleeding today",
  "reminder.messageOverdue": "Your period was expected {date}. Started?",
  "reminder.messageUpcoming": "Your period is expected {date}. Started?",
  "reminder.dismiss": "Not yet — remind me later",
  "reminder.reassure": "A few days of variation is common.",

  // Calendar
  "calendar.title": "Calendar",
  "calendar.previousMonth": "Previous month",
  "calendar.nextMonth": "Next month",
  "calendar.jumpToMonth": "Jump to month",
  "calendar.month": "Month",
  "calendar.year": "Year",
  "calendar.tapHelp": "Tap a day to log or edit bleeding.",
  "calendar.today": "Today",
  "calendar.goToCurrentMonth": "Go to current month",
  "calendar.justLogged": "Logged {date}.",
  "calendar.justLoggedForecast": "Logged {date}. Forecast updated.",
  "calendar.undo": "Undo",
  "calendar.logRange": "Log a past period",
  "calendar.rangePickFirst": "Pick the first day of the period.",
  "calendar.rangePickLast":
    "From {date}: now pick the last day, up to {max} days.",
  "calendar.rangeTooLong": "More than {max} days. Pick a closer last day.",
  "calendar.emptyHelp": "Tap a past day to log your first bleeding day.",
  "calendar.futureHelp": "Future days can't be logged yet.",
  "calendar.log": "Log",
  "calendar.edit": "Edit",
  "calendar.dayUnavailable": "{label} unavailable",
  "calendar.dayWithMarker": "{label}, {marker}",
  "marker.fertile": "fertile window",
  "marker.ovulation": "expected ovulation",
  "marker.predictedPeriod": "expected period",
  "calendar.notBleeding": "Not bleeding that day",

  // Shared
  "common.unknown": "unknown",
  "common.close": "Close",
  "common.cancel": "Cancel",
  "common.days": "days",
  "common.reload": "Reload",

  // Crash screen
  "error.title": "Something went wrong",
  "error.body": "Your logged days are still saved on this device.",
  "error.downloadRaw": "Download raw data",

  // Settings
  "settings.title": "Settings",
  "settings.preferences": "Preferences",
  "settings.theme": "Theme",
  "theme.system": "System",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "settings.language": "Language",
  "language.system": "Device language",
  // Language names are endonyms — identical in every dictionary.
  "language.en": "English",
  "language.nl": "Nederlands",
  "language.de": "Deutsch",
  "language.fr": "Français",
  "language.es": "Español",
  "settings.showFertility": "Show fertility estimates",
  "settings.fertilityInfo": "About fertility estimates",
  "settings.fertilityHelp":
    "Shows the fertile window and expected ovulation on Today and in the calendar.",
  "settings.showCycleNumbers": "Show cycle day numbers",
  "settings.cycleNumbersInfo": "About cycle day numbers",
  "settings.cycleNumbersHelp":
    "Numbers the days of your current cycle (1, 2, 3, ...) on the calendar, up to your next expected period.",
  "settings.about": "About",
  "settings.privacy": "Your data never leaves this device.",
  "settings.fertilityDisclaimer":
    "Fertility estimates are for information only. They are not birth control.",
  "settings.fertilityMethod":
    "The fertile window is the days around your expected ovulation, estimated from your recent cycle lengths.",
  "settings.sourceCode": "Source code, v{version}, opens in a new tab",
  "settings.data": "Data",
  "settings.dataInfo": "About import and export",
  "settings.dataHelp":
    "Export saves your days to a file. Import replaces them from a Tide backup, or adds days from Clue or Flo.",
  "settings.importSources":
    "You can import a Tide backup, or an export from Clue or Flo.",
  "settings.export": "Export",
  "settings.exportSuccess": "Backup saved to your downloads.",
  "settings.exportCalendar": "Add to calendar",
  "settings.calendarHelp":
    "Saves your next 3 expected periods as a file your calendar app can open. Once added, they sync like your other events, so the calendar's account holds them too.",
  "settings.calendarFertility": "Include fertile windows",
  "settings.calendarSuccess": "Calendar file saved to your downloads.",
  "settings.calendarError":
    "The calendar file couldn't be made. Reload Tide and try again.",
  "settings.import": "Import",
  "settings.importFile": "Import data file",
  "settings.importError":
    "That file isn't a Tide backup or a Clue or Flo export.",
  "settings.importSuccess.one": "Imported {n} logged day.",
  "settings.importSuccess.other": "Imported {n} logged days.",
  "settings.importConfirmTitle": "Replace your data?",
  "settings.importConfirmAction": "Replace",
  "settings.importFileDays.one": "This file holds {n} logged day.",
  "settings.importFileDays.other": "This file holds {n} logged days.",
  "settings.importReplaces.one":
    "It replaces the {n} day logged on this device, and cannot be undone.",
  "settings.importReplaces.other":
    "It replaces the {n} days logged on this device, and cannot be undone.",
  "settings.importMergeTitle": "Add days from {source}?",
  "settings.importMergeAction": "Add",
  "settings.importMerges": "Days already logged here stay as they are.",
  "settings.reset": "Delete all data",
  "settings.resetTitle": "Delete all data?",
  "settings.resetAction": "Delete",
  "settings.resetConfirm":
    "Every logged day and setting on this device is erased. This cannot be undone.",
} as const;

export type MessageKey = keyof typeof en;
export type Dictionary = Record<MessageKey, string>;
