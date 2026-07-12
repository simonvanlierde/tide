// biome-ignore-all lint/security/noSecrets: the German language is full of high-entropy strings :)
import type { Dictionary } from "./en";

export const de: Dictionary = {
  "nav.today": "Heute",
  "nav.calendar": "Kalender",
  "nav.settings": "Einstellungen",
  "app.skipToContent": "Zum Inhalt springen",
  "app.primaryNav": "Hauptnavigation",

  "today.srCycleDay": "Zyklustag {day}, {phase}",
  "today.nextPeriod": "Nächste Periode",
  "today.fertility": "Fruchtbarkeit",
  "today.fertilityInfoLabel": "Wie die Fruchtbarkeit geschätzt wird",
  "today.cycleInsights": "Zyklus-Einblicke",
  "today.notEnoughData": "Noch nicht genügend Daten",
  "today.daysAgo.one": "vor {n} Tag",
  "today.daysAgo.other": "vor {n} Tagen",
  "today.expectedToday": "Heute erwartet",
  "today.inDays.one": "in {n} Tag",
  "today.inDays.other": "in {n} Tagen",
  "today.higherToday": "Heute höher",
  "today.lowerToday": "Heute niedriger",
  "today.ovulationDaysAgo.one": "Eisprung vor {n} Tag",
  "today.ovulationDaysAgo.other": "Eisprung vor {n} Tagen",
  "today.ovulationToday": "Eisprung heute",
  "today.ovulationInDays.one": "Eisprung in {n} Tag",
  "today.ovulationInDays.other": "Eisprung in {n} Tagen",
  "today.learningFallback":
    "Es wird von einem typischen 28-Tage-Zyklus ausgegangen, bis dein Muster erkannt ist.",
  "today.learningInsufficient":
    "Erfasse Blutungen, um eine Schätzung zu starten.",

  "phase.menstrual": "Menstruation",
  "phase.follicular": "Follikulär",
  "phase.ovulation": "Eisprung",
  "phase.luteal": "Luteal",
  "phase.learning": "Lernen",
  "phaseLine.menstrual": "Menstruationsphase",
  "phaseLine.follicular": "Follikelphase",
  "phaseLine.ovulation": "Ovulationsphase",
  "phaseLine.luteal": "Lutealphase",
  "phaseLine.learning": "Lernen",

  "dial.cycleDay": "Zyklustag",
  "dial.day": "Tag {n}",
  "status.period": "Periode",
  "status.ovulationExpected": "Eisprung erwartet",
  "status.fertileWindow": "Fruchtbares Fenster",
  "status.periodExpected": "Periode erwartet",

  "insights.title": "Zyklus-Einblicke",
  "insights.cycleLength": "Zykluslänge",
  "insights.periodLength": "Periodendauer",
  "insights.cyclesTracked": "Erfasste Zyklen",
  "insights.basedOn":
    "Basierend auf einem typischen {cycle}-Tage-Zyklus, bis du einen vollständigen Zyklus erfasst hast.",
  "insights.regularity": "Zyklusregelmäßigkeit",
  "insights.regularityAria": "Zyklusregelmäßigkeit: {label}",
  "regularity.none": "Noch nicht genügend Daten",
  "regularity.veryRegular": "Sehr regelmäßig",
  "regularity.regular": "Regelmäßig",
  "regularity.somewhatVariable": "Etwas schwankend",
  "regularity.variable": "Schwankend",
  "insights.how": "So funktionieren die Vorhersagen",
  "insights.how1":
    "Alles wird auf deinem Gerät aus den von dir erfassten Tagen berechnet.",
  "insights.how2":
    "Die Zykluslänge ist der Median deiner letzten {recent} Zyklen, damit ein einzelner ungewöhnlicher Monat sie nicht verfälscht. Vor zwei Zyklen wird ein typischer {cycle}-Tage-Zyklus verwendet.",
  "insights.how3":
    "Die Periodendauer ist dein aktueller Durchschnitt, begrenzt auf normale {min}–{max} Tage.",
  "insights.how4":
    "Deine nächste Periode ist dein letzter Beginn plus diese Zykluslänge; der Eisprung wird {luteal} Tage davor geschätzt.",
  "insights.how5":
    "Das fruchtbare Fenster reicht von {before} Tagen vor bis {after} Tag nach dem Eisprung und wird breiter, wenn deine Zyklen stärker schwanken.",

  "legend.period": "Periode",
  "legend.fertileWindow": "Fruchtbares Fenster",
  "legend.ovulation": "Eisprung",

  "flow.legend": "Blutung",
  "flow.spotting": "Schmierblutung",
  "flow.light": "Leicht",
  "flow.medium": "Mittel",
  "flow.heavy": "Stark",

  "log.remove": "Blutungseintrag entfernen",
  "log.add": "Blutung heute erfassen",
  "reminder.messageOverdue":
    "Deine Periode wurde am {date} erwartet. Angefangen?",
  "reminder.messageUpcoming":
    "Deine Periode wird am {date} erwartet. Angefangen?",
  "reminder.dismiss": "Noch nicht — später erinnern",

  "calendar.title": "Kalender",
  "calendar.previousMonth": "Voriger Monat",
  "calendar.nextMonth": "Nächster Monat",
  "calendar.jumpToMonth": "Zum Monat springen",
  "calendar.month": "Monat",
  "calendar.year": "Jahr",
  "calendar.tapHelp":
    "Tippe auf einen Tag, um eine Blutung zu erfassen oder zu bearbeiten.",
  "calendar.today": "Heute",
  "calendar.goToCurrentMonth": "Zum aktuellen Monat",
  "calendar.noDays": "Noch keine Blutungstage erfasst.",
  "calendar.legend.logged": "Erfasst",
  "calendar.legend.predicted": "Erwartet",
  "calendar.legend.fertile": "Fruchtbar",
  "calendar.legend.ovulation": "Eisprung",
  "calendar.log": "Erfassen",
  "calendar.edit": "Bearbeiten",
  "calendar.dayUnavailable": "{label} nicht verfügbar",
  "calendar.dayWithMarker": "{label}, {marker}",
  "marker.fertile": "fruchtbares Fenster",
  "marker.ovulation": "wahrscheinlicher Eisprung",
  "marker.predictedPeriod": "erwartete Periode",
  "calendar.notBleeding": "Keine Blutung an diesem Tag",

  "common.unknown": "unbekannt",
  "common.close": "Schließen",
  "common.days": "Tage",

  "settings.title": "Einstellungen",
  "settings.preferences": "Präferenzen",
  "settings.theme": "Design",
  "theme.system": "System",
  "theme.light": "Hell",
  "theme.dark": "Dunkel",
  "settings.language": "Sprache",
  "language.system": "System",
  "language.en": "English",
  "language.nl": "Nederlands",
  "language.de": "Deutsch",
  "language.fr": "Français",
  "language.es": "Español",
  "settings.showFertility": "Fruchtbarkeitsschätzungen anzeigen",
  "settings.fertilityInfo": "Über Fruchtbarkeitsschätzungen",
  "settings.fertilityHelp":
    "Zeigt Schätzungen zum fruchtbaren Fenster und zum Eisprung auf dem Startbildschirm und im Kalender.",
  "settings.showCycleNumbers": "Zyklustagnummern anzeigen",
  "settings.cycleNumbersInfo": "Über Zyklustagnummern",
  "settings.cycleNumbersHelp":
    "Nummeriert die Tage deines aktuellen Zyklus (1, 2, 3, ...) im Kalender, bis zu deiner nächsten erwarteten Periode.",
  "settings.about": "Über",
  "settings.privacy": "Deine Daten verlassen dieses Gerät nie.",
  "settings.fertilityDisclaimer":
    "Fruchtbarkeitsschätzungen dienen der Information und sind keine Verhütungsmethode.",
  "settings.fertilityMethod":
    "Höher rund um deinen vorhergesagten Eisprung. Geschätzt anhand deiner letzten Zykluslängen.",
  "settings.sourceCode": "Quellcode (v{version}), öffnet in einem neuen Tab",
  "settings.data": "Daten",
  "settings.dataInfo": "Über Import und Export",
  "settings.dataHelp":
    "Der Export speichert deine Tage in einer Datei. Der Import ersetzt sie aus einer Sicherung.",
  "settings.export": "Exportieren",
  "settings.import": "Importieren",
  "settings.importFile": "Datendatei importieren",
  "settings.importError": "Diese Datei ist keine gültige Tide-Sicherung.",
};
