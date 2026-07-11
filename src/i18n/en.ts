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

  // Today screen
  "today.srCycleDay": "Cycle day {day}, {phase}",
  "today.nextPeriod": "Next period",
  "today.fertility": "Fertility",
  "today.fertilityInfoLabel": "How fertility is estimated",
  "today.cycleInsights": "Cycle insights",
  "today.notEnoughData": "Not enough data yet",
  "today.daysAgo.one": "{n} day ago",
  "today.daysAgo.other": "{n} days ago",
  "today.expectedToday": "Expected today",
  "today.inDays.one": "In {n} day",
  "today.inDays.other": "In {n} days",
  "today.higherToday": "Higher today",
  "today.lowerToday": "Lower today",
  "today.ovulationDaysAgo.one": "Ovulation {n} day ago",
  "today.ovulationDaysAgo.other": "Ovulation {n} days ago",
  "today.ovulationToday": "Ovulation today",
  "today.ovulationInDays.one": "Ovulation in {n} day",
  "today.ovulationInDays.other": "Ovulation in {n} days",
  "today.learningFallback":
    "Using a typical 28-day cycle until we learn your pattern.",
  "today.learningInsufficient": "Log bleeding to start an estimate.",

  // Cycle phases: word form (heading) and line form ("X phase")
  "phase.menstrual": "Menstrual",
  "phase.follicular": "Follicular",
  "phase.ovulation": "Ovulation",
  "phase.luteal": "Luteal",
  "phase.learning": "Learning",
  "phaseLine.menstrual": "Menstrual phase",
  "phaseLine.follicular": "Follicular phase",
  "phaseLine.ovulation": "Ovulation phase",
  "phaseLine.luteal": "Luteal phase",
  "phaseLine.learning": "Learning",

  // Cycle dial + segment status (shown in the dial centre and read aloud)
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
  "insights.how2":
    "Cycle length is the median of your last {recent} cycles, so one odd month doesn’t throw it off. Before two cycles, a typical {cycle}-day cycle is used.",
  "insights.how3":
    "Period length is your recent average, kept to a normal {min}–{max} days.",
  "insights.how4":
    "Your next period is your last start plus that cycle length; ovulation is estimated {luteal} days before it.",
  "insights.how5":
    "The fertile window runs {before} days before to {after} day after ovulation, and widens when your cycles vary more.",

  // Today-screen legend
  "legend.period": "Period",
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
  "log.add": "Log bleeding today",
  "reminder.messageOverdue": "Your period was expected {date}. Started?",
  "reminder.messageUpcoming": "Your period is expected {date}. Started?",
  "reminder.dismiss": "Not yet — remind me later",

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
  "calendar.noDays": "No bleeding days logged yet.",
  "calendar.legend.logged": "Logged",
  "calendar.legend.predicted": "Expected",
  "calendar.legend.fertile": "Fertile",
  "calendar.legend.ovulation": "Ovulation",
  "calendar.log": "Log",
  "calendar.edit": "Edit",
  "calendar.dayUnavailable": "{label} unavailable",
  "calendar.dayWithMarker": "{label}, {marker}",
  "marker.fertile": "fertile window",
  "marker.ovulation": "likely ovulation",
  "marker.predictedPeriod": "expected period",
  "calendar.notBleeding": "Not bleeding that day",

  // Shared
  "common.unknown": "unknown",
  "common.close": "Close",
  "common.days": "days",

  // Settings
  "settings.title": "Settings",
  "settings.preferences": "Preferences",
  "settings.theme": "Theme",
  "theme.system": "System",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "settings.language": "Language",
  "language.system": "System",
  // Language names are endonyms — identical in every dictionary.
  "language.en": "English",
  "language.nl": "Nederlands",
  "language.de": "Deutsch",
  "language.fr": "Français",
  "language.es": "Español",
  "settings.showFertility": "Show fertility estimates",
  "settings.fertilityInfo": "About fertility estimates",
  "settings.fertilityHelp":
    "Shows fertile-window and ovulation estimates on the home screen and calendar.",
  "settings.showCycleNumbers": "Show cycle day numbers",
  "settings.cycleNumbersInfo": "About cycle day numbers",
  "settings.cycleNumbersHelp":
    "Numbers the days of your current cycle (1, 2, 3, ...) on the calendar, up to your next expected period.",
  "settings.about": "About",
  "settings.privacy": "Your data never leaves this device.",
  "settings.fertilityDisclaimer":
    "Fertility estimates are informational, not a birth control method.",
  "settings.fertilityMethod":
    "Higher around your predicted ovulation. Estimated from your recent cycle lengths.",
  "settings.sourceCode": "Source code (v{version}), opens in a new tab",
  "settings.data": "Data",
  "settings.dataInfo": "About import and export",
  "settings.dataHelp":
    "Export saves your days to a file. Import replaces them from a backup.",
  "settings.export": "Export",
  "settings.import": "Import",
  "settings.importFile": "Import data file",
  "settings.importError": "That file isn't a valid Tide backup.",
} as const;

export type MessageKey = keyof typeof en;
export type Dictionary = Record<MessageKey, string>;
