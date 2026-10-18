// biome-ignore-all lint/security/noSecrets: the German language is full of high-entropy strings :)
import type { Dictionary } from "./en";

export const de: Dictionary = {
  "nav.today": "Heute",
  "nav.calendar": "Kalender",
  "nav.settings": "Einstellungen",
  "app.skipToContent": "Zum Inhalt springen",
  "app.primaryNav": "Hauptnavigation",
  "app.newerData":
    "Eine neuere Version von Tide hat deine Daten gespeichert. Lade neu, um zu aktualisieren; Änderungen hier werden nicht gespeichert.",

  "today.srCycleDay": "Zyklustag {day}, {phase}",
  "today.nextPeriod": "Nächste Periode",
  "today.fertility": "Fruchtbarkeit",
  "today.fertilityInfoLabel": "Wie die Fruchtbarkeit geschätzt wird",
  "today.cycleInsights": "Zyklus-Einblicke",
  "today.howWorkedOut": "Wie wurde das berechnet?",
  "today.daysAgo.one": "vor {n} Tag",
  "today.daysAgo.other": "vor {n} Tagen",
  "today.expectedToday": "Heute erwartet",
  "today.inDays.one": "in {n} Tag",
  "today.inDays.other": "in {n} Tagen",
  "today.higherToday": "Im fruchtbaren Fenster (Schätzung)",
  "today.lowerToday": "Außerhalb des fruchtbaren Fensters (Schätzung)",
  "today.notBirthControl": "Keine Verhütungsmethode",
  "fertilityAsk.title": "Fruchtbarkeitsschätzungen anzeigen?",
  "fertilityAsk.body":
    "Tide kann die Tage markieren, an denen du am ehesten fruchtbar bist, berechnet aus deinen erfassten Perioden. Das ist eine Schätzung, keine Verhütungsmethode. Du kannst das in den Einstellungen ändern.",
  "fertilityAsk.show": "Anzeigen",
  "fertilityAsk.hide": "Nicht anzeigen",
  "today.privacy": "Nur auf diesem Gerät gespeichert.",
  "today.importPrompt":
    "Hast du eine Tide-Sicherung oder Daten aus Clue oder Flo?",
  "today.importLink": "Importieren",
  "today.fertilityUnclear": "Unklar bei Verspätung",
  "today.periodLate": "Periode",
  "today.daysLate.one": "{n} Tag überfällig",
  "today.daysLate.other": "{n} Tage überfällig",
  "today.expectedOn": "Erwartet {date}",
  "today.ovulationDaysAgo.one": "Eisprung vor {n} Tag",
  "today.ovulationDaysAgo.other": "Eisprung vor {n} Tagen",
  "today.ovulationToday": "Eisprung heute",
  "today.ovulationInDays.one": "Eisprung in {n} Tag",
  "today.ovulationInDays.other": "Eisprung in {n} Tagen",
  "today.learningFallback":
    "Es wird von einem typischen 28-Tage-Zyklus ausgegangen, bis dein Muster erkannt ist.",
  "today.learningInsufficient":
    "Erfasse deine Periode, um eine Vorhersage zu sehen.",

  "phase.menstrual": "Menstruation",
  "phase.follicular": "Follikulär",
  "phase.ovulation": "Eisprung",
  "phase.luteal": "Luteal",
  "phase.learning": "Lernen",
  "phase.between": "Zwischen den Perioden",
  "phaseLine.menstrual": "Menstruationsphase",
  "phaseLine.follicular": "Follikelphase",
  "phaseLine.ovulation": "Ovulationsphase",
  "phaseLine.luteal": "Lutealphase",
  "phaseLine.learning": "Lernen",
  "phaseLine.between": "Zwischen den Perioden",
  "phaseLine.late": "Periode erwartet",

  "dial.overview": "Zyklusübersicht",
  "dial.days": "Zyklustage",
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
  "insights.howCycleStart":
    "Eine Lücke von {gap} Tagen oder mehr zwischen erfassten Tagen beginnt einen neuen Zyklus; kürzere Lücken gehören zur selben Periode.",
  "insights.how2":
    "Die Zykluslänge ist der Median deiner letzten {recent} Zyklen, damit ein einzelner ungewöhnlicher Monat sie nicht verfälscht. Vor zwei Zyklen wird ein typischer {cycle}-Tage-Zyklus verwendet.",
  "insights.how3":
    "Die Periodendauer ist dein aktueller Durchschnitt, begrenzt auf normale {min}–{max} Tage.",
  "insights.how4":
    "Deine nächste Periode ist dein letzter Beginn plus diese Zykluslänge; der Eisprung wird {luteal} Tage davor geschätzt.",
  "insights.howNextPeriod":
    "Deine nächste Periode ist dein letzter Beginn plus diese Zykluslänge.",
  "insights.how5":
    "Das fruchtbare Fenster reicht von {before} Tagen vor bis {after} Tag nach dem Eisprung und wird breiter, wenn deine Zyklen stärker schwanken.",

  "legend.period": "Periode",
  "legend.expected": "Erwartete Periode",
  "legend.fertileWindow": "Fruchtbares Fenster",
  "legend.ovulation": "Eisprung",

  "flow.legend": "Blutung",
  "flow.spotting": "Schmierblutung",
  "flow.light": "Leicht",
  "flow.medium": "Mittel",
  "flow.heavy": "Stark",

  "log.remove": "Blutungseintrag entfernen",
  "log.logged": "Heute protokolliert",
  "log.loggedWith": "Heute protokolliert · {flow}",
  "log.add": "Blutung heute erfassen",
  "reminder.messageOverdue":
    "Deine Periode wurde am {date} erwartet. Angefangen?",
  "reminder.messageUpcoming":
    "Deine Periode wird am {date} erwartet. Angefangen?",
  "reminder.dismiss": "Noch nicht — später erinnern",
  "reminder.reassure": "Ein paar Tage Abweichung sind normal.",

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
  "calendar.justLogged": "{date} erfasst.",
  "calendar.justLoggedForecast": "{date} erfasst. Prognose aktualisiert.",
  "calendar.undo": "Rückgängig",
  "calendar.logRange": "Vergangene Periode erfassen",
  "calendar.rangePickFirst": "Wähle den ersten Tag der Periode.",
  "calendar.rangePickLast":
    "Ab {date}: Wähle jetzt den letzten Tag, höchstens {max} Tage.",
  "calendar.rangeTooLong":
    "Mehr als {max} Tage. Wähle einen näheren letzten Tag.",
  "calendar.emptyHelp":
    "Tippe auf einen vergangenen Tag, um deinen ersten Blutungstag zu erfassen.",
  "calendar.futureHelp": "Zukünftige Tage lassen sich noch nicht erfassen.",
  "calendar.log": "Erfassen",
  "calendar.edit": "Bearbeiten",
  "calendar.dayUnavailable": "{label} nicht verfügbar",
  "calendar.dayWithMarker": "{label}, {marker}",
  "marker.fertile": "fruchtbares Fenster",
  "marker.ovulation": "erwarteter Eisprung",
  "marker.predictedPeriod": "erwartete Periode",
  "calendar.notBleeding": "Keine Blutung an diesem Tag",

  "common.unknown": "unbekannt",
  "common.close": "Schließen",
  "common.cancel": "Abbrechen",
  "common.days": "Tage",
  "common.reload": "Neu laden",

  // Crash screen
  "error.title": "Etwas ist schiefgelaufen",
  "error.body":
    "Deine erfassten Tage sind weiterhin auf diesem Gerät gespeichert.",
  "error.downloadRaw": "Rohdaten herunterladen",

  "settings.title": "Einstellungen",
  "settings.preferences": "Präferenzen",
  "settings.theme": "Design",
  "theme.system": "System",
  "theme.light": "Hell",
  "theme.dark": "Dunkel",
  "settings.language": "Sprache",
  "language.system": "Gerätesprache",
  "language.en": "English",
  "language.nl": "Nederlands",
  "language.de": "Deutsch",
  "language.fr": "Français",
  "language.es": "Español",
  "settings.showFertility": "Fruchtbarkeitsschätzungen anzeigen",
  "settings.fertilityInfo": "Über Fruchtbarkeitsschätzungen",
  "settings.fertilityHelp":
    "Zeigt das fruchtbare Fenster und den erwarteten Eisprung unter Heute und im Kalender.",
  "settings.showCycleNumbers": "Zyklustagnummern anzeigen",
  "settings.cycleNumbersInfo": "Über Zyklustagnummern",
  "settings.cycleNumbersHelp":
    "Nummeriert die Tage deines aktuellen Zyklus (1, 2, 3, ...) im Kalender, bis zu deiner nächsten erwarteten Periode.",
  "settings.about": "Über",
  "settings.privacy": "Deine Daten verlassen dieses Gerät nie.",
  "settings.fertilityDisclaimer":
    "Fruchtbarkeitsschätzungen dienen nur der Information. Sie sind keine Verhütungsmethode.",
  "settings.fertilityMethod":
    "Das fruchtbare Fenster sind die Tage rund um deinen erwarteten Eisprung, geschätzt anhand deiner letzten Zykluslängen.",
  "settings.sourceCode": "Quellcode (v{version}), öffnet in einem neuen Tab",
  "settings.data": "Daten",
  "settings.dataInfo": "Über Import und Export",
  "settings.dataHelp":
    "Der Export speichert deine Tage in einer Datei. Der Import ersetzt sie aus einer Tide-Sicherung oder fügt Tage aus Clue oder Flo hinzu.",
  "settings.importSources":
    "Du kannst eine Tide-Sicherung importieren oder einen Export aus Clue oder Flo.",
  "settings.export": "Exportieren",
  "settings.exportSuccess": "Sicherung in deinen Downloads gespeichert.",
  "settings.exportCalendar": "Zum Kalender",
  "settings.calendarHelp":
    "Speichert deine nächsten 3 erwarteten Perioden als Datei für deine Kalender-App.",
  "settings.calendarFertility": "Fruchtbare Fenster einschließen",
  "settings.calendarSuccess": "Kalenderdatei in deinen Downloads gespeichert.",
  "settings.import": "Importieren",
  "settings.importFile": "Datendatei importieren",
  "settings.importError":
    "Diese Datei ist weder eine Tide-Sicherung noch ein Clue- oder Flo-Export.",
  "settings.importSuccess.one": "{n} protokollierter Tag importiert.",
  "settings.importSuccess.other": "{n} protokollierte Tage importiert.",
  "settings.importConfirmTitle": "Deine Daten ersetzen?",
  "settings.importConfirmAction": "Ersetzen",
  "settings.importFileDays.one": "Diese Datei enthält {n} erfassten Tag.",
  "settings.importFileDays.other": "Diese Datei enthält {n} erfasste Tage.",
  "settings.importReplaces.one":
    "Sie ersetzt den {n} auf diesem Gerät erfassten Tag und lässt sich nicht rückgängig machen.",
  "settings.importReplaces.other":
    "Sie ersetzt die {n} auf diesem Gerät erfassten Tage und lässt sich nicht rückgängig machen.",
  "settings.importMergeTitle": "Tage aus {source} hinzufügen?",
  "settings.importMergeAction": "Hinzufügen",
  "settings.importMerges": "Hier bereits erfasste Tage bleiben, wie sie sind.",
  "settings.reset": "Alle Daten löschen",
  "settings.resetTitle": "Alle Daten löschen?",
  "settings.resetAction": "Löschen",
  "settings.resetConfirm":
    "Alle erfassten Tage und Einstellungen auf diesem Gerät werden gelöscht. Das lässt sich nicht rückgängig machen.",
};
