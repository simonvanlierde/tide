import type { Dictionary } from "./en";

export const fr: Dictionary = {
  "nav.today": "Aujourd’hui",
  "nav.calendar": "Calendrier",
  "nav.settings": "Réglages",
  "app.skipToContent": "Aller au contenu",
  "app.primaryNav": "Navigation principale",
  "app.newerData":
    "Une version plus récente de Tide a enregistré tes données. Recharge pour mettre à jour ; les modifications faites ici ne sont pas enregistrées.",

  "today.srCycleDay": "Jour du cycle {day}, {phase}",
  "today.nextPeriod": "Prochaines règles",
  "today.fertility": "Fertilité",
  "today.fertilityInfoLabel": "Comment la fertilité est estimée",
  "today.cycleInsights": "Aperçu du cycle",
  "today.howWorkedOut": "Comment est-ce calculé ?",
  "today.explainError": "Impossible d’ouvrir ceci. Recharge Tide et réessaie.",
  "today.daysAgo.one": "il y a {n} jour",
  "today.daysAgo.other": "il y a {n} jours",
  "today.expectedToday": "Prévues aujourd’hui",
  "today.inDays.one": "Dans {n} jour",
  "today.inDays.other": "Dans {n} jours",
  "today.higherToday": "Dans la fenêtre de fertilité (estimation)",
  "today.lowerToday": "Hors de la fenêtre de fertilité (estimation)",
  "today.notBirthControl": "Pas une contraception",
  "fertilityAsk.title": "Afficher les estimations de fertilité ?",
  "fertilityAsk.body":
    "Tide peut indiquer les jours où tu es le plus susceptible d’être fertile, calculés à partir des règles que tu enregistres. C’est une estimation, pas une contraception. Tu pourras changer d’avis dans les Réglages.",
  "fertilityAsk.show": "Afficher",
  "fertilityAsk.hide": "Ne pas afficher",
  "today.privacy": "Stocké uniquement sur cet appareil.",
  "today.importPrompt":
    "Tu as une sauvegarde Tide ou un historique Clue ou Flo ?",
  "today.importLink": "L’importer",
  "today.fertilityUnclear": "Incertaine en cas de retard",
  "today.periodLate": "Règles",
  "today.daysLate.one": "{n} jour de retard",
  "today.daysLate.other": "{n} jours de retard",
  "today.expectedOn": "Attendues {date}",
  "today.ovulationDaysAgo.one": "Ovulation il y a {n} jour",
  "today.ovulationDaysAgo.other": "Ovulation il y a {n} jours",
  "today.ovulationToday": "Ovulation aujourd’hui",
  "today.ovulationInDays.one": "Ovulation dans {n} jour",
  "today.ovulationInDays.other": "Ovulation dans {n} jours",
  "today.learningFallback":
    "Un cycle type de 28 jours est utilisé jusqu’à ce que nous apprenions ton rythme.",
  "today.learningInsufficient":
    "Enregistre tes règles pour voir une prévision.",

  "phase.menstrual": "Menstruelle",
  "phase.follicular": "Folliculaire",
  "phase.ovulation": "Ovulation",
  "phase.luteal": "Lutéale",
  "phase.learning": "Apprentissage",
  "phase.between": "Entre deux règles",
  "phaseLine.menstrual": "Phase menstruelle",
  "phaseLine.follicular": "Phase folliculaire",
  "phaseLine.ovulation": "Phase d’ovulation",
  "phaseLine.luteal": "Phase lutéale",
  "phaseLine.learning": "Apprentissage",
  "phaseLine.between": "Entre deux règles",
  "phaseLine.late": "Règles attendues",

  "dial.overview": "Aperçu du cycle",
  "dial.days": "Jours du cycle",
  "dial.cycleDay": "Jour du cycle",
  "dial.day": "Jour {n}",
  "status.period": "Règles",
  "status.ovulationExpected": "Ovulation prévue",
  "status.fertileWindow": "Fenêtre de fertilité",
  "status.periodExpected": "Règles prévues",

  "insights.title": "Aperçu du cycle",
  "insights.cycleLength": "Durée du cycle",
  "insights.periodLength": "Durée des règles",
  "insights.cyclesTracked": "Cycles suivis",
  "insights.basedOn":
    "Basé sur un cycle type de {cycle} jours jusqu’à ce que tu aies enregistré un cycle complet.",
  "insights.regularity": "Régularité du cycle",
  "insights.regularityAria": "Régularité du cycle : {label}",
  "regularity.none": "Pas encore assez de données",
  "regularity.veryRegular": "Très régulier",
  "regularity.regular": "Régulier",
  "regularity.somewhatVariable": "Un peu variable",
  "regularity.variable": "Variable",
  "insights.how": "Comment les prévisions fonctionnent",
  "insights.how1":
    "Tout est calculé sur ton appareil à partir des jours que tu enregistres.",
  "insights.howCycleStart":
    "Un écart de {gap} jours ou plus entre deux jours enregistrés marque le début d’un nouveau cycle ; les écarts plus courts font partie des mêmes règles.",
  "insights.how2":
    "La durée du cycle est la médiane de tes {recent} derniers cycles, pour qu’un mois inhabituel ne la fausse pas. Avant deux cycles, un cycle type de {cycle} jours est utilisé.",
  "insights.how3":
    "La durée des règles est ta moyenne récente, limitée à une normale de {min} à {max} jours.",
  "insights.how4":
    "Tes prochaines règles correspondent au début de tes dernières règles plus cette durée de cycle ; l’ovulation est estimée {luteal} jours avant.",
  "insights.howNextPeriod":
    "Tes prochaines règles correspondent au début de tes dernières règles plus cette durée de cycle.",
  "insights.how5":
    "La fenêtre de fertilité s’étend de {before} jours avant à {after} jour après l’ovulation, et s’élargit quand tes cycles varient davantage.",

  "legend.period": "Règles",
  "legend.expected": "Règles prévues",
  "legend.fertileWindow": "Fenêtre de fertilité",
  "legend.ovulation": "Ovulation",

  "flow.legend": "Flux",
  "flow.spotting": "Spotting",
  "flow.light": "Léger",
  "flow.medium": "Moyen",
  "flow.heavy": "Abondant",

  "log.remove": "Supprimer le saignement",
  "log.logged": "Enregistré aujourd’hui",
  "log.loggedWith": "Enregistré aujourd’hui · {flow}",
  "log.add": "Enregistrer le saignement du jour",
  "reminder.messageOverdue":
    "Tes règles étaient prévues le {date}. Commencées ?",
  "reminder.messageUpcoming": "Tes règles sont prévues le {date}. Commencées ?",
  "reminder.dismiss": "Pas encore — me le rappeler plus tard",
  "reminder.reassure": "Quelques jours de variation, c’est courant.",

  "calendar.title": "Calendrier",
  "calendar.previousMonth": "Mois précédent",
  "calendar.nextMonth": "Mois suivant",
  "calendar.jumpToMonth": "Aller au mois",
  "calendar.month": "Mois",
  "calendar.year": "Année",
  "calendar.tapHelp":
    "Touche un jour pour enregistrer ou modifier un saignement.",
  "calendar.today": "Aujourd’hui",
  "calendar.goToCurrentMonth": "Aller au mois actuel",
  "calendar.justLogged": "{date} enregistré.",
  "calendar.justLoggedForecast": "{date} enregistré. Prévision mise à jour.",
  "calendar.undo": "Annuler",
  "calendar.logRange": "Enregistrer des règles passées",
  "calendar.rangePickFirst": "Choisis le premier jour des règles.",
  "calendar.rangePickLast":
    "À partir du {date} : choisis le dernier jour, {max} jours au plus.",
  "calendar.rangeTooLong":
    "Plus de {max} jours. Choisis un dernier jour plus proche.",
  "calendar.emptyHelp":
    "Touche un jour passé pour enregistrer ton premier jour de saignement.",
  "calendar.futureHelp":
    "Les jours à venir ne peuvent pas encore être enregistrés.",
  "calendar.log": "Enregistrer",
  "calendar.edit": "Modifier",
  "calendar.dayUnavailable": "{label} indisponible",
  "calendar.dayWithMarker": "{label}, {marker}",
  "marker.fertile": "fenêtre de fertilité",
  "marker.ovulation": "ovulation prévue",
  "marker.predictedPeriod": "règles prévues",
  "calendar.notBleeding": "Pas de saignement ce jour-là",

  "common.unknown": "inconnu",
  "common.close": "Fermer",
  "common.cancel": "Annuler",
  "common.days": "jours",
  "common.reload": "Recharger",

  // Crash screen
  "error.title": "Un problème est survenu",
  "error.body": "Tes jours enregistrés sont toujours sur cet appareil.",
  "error.downloadRaw": "Télécharger les données brutes",

  "settings.title": "Réglages",
  "settings.preferences": "Préférences",
  "settings.theme": "Thème",
  "theme.system": "Système",
  "theme.light": "Clair",
  "theme.dark": "Sombre",
  "settings.language": "Langue",
  "language.system": "Langue de l’appareil",
  "language.en": "English",
  "language.nl": "Nederlands",
  "language.de": "Deutsch",
  "language.fr": "Français",
  "language.es": "Español",
  "settings.showFertility": "Afficher les estimations de fertilité",
  "settings.fertilityInfo": "À propos des estimations de fertilité",
  "settings.fertilityHelp":
    "Affiche la fenêtre de fertilité et l’ovulation prévue dans Aujourd’hui et dans le calendrier.",
  "settings.showCycleNumbers": "Afficher les numéros de jour du cycle",
  "settings.cycleNumbersInfo": "À propos des numéros de jour du cycle",
  "settings.cycleNumbersHelp":
    "Numérote les jours de ton cycle actuel (1, 2, 3, ...) sur le calendrier, jusqu’à tes prochaines règles prévues.",
  "settings.about": "À propos",
  "settings.privacy": "Tes données ne quittent jamais cet appareil.",
  "settings.fertilityDisclaimer":
    "Les estimations de fertilité sont données à titre indicatif. Elles ne sont pas une contraception.",
  "settings.fertilityMethod":
    "La fenêtre de fertilité, ce sont les jours autour de ton ovulation prévue, estimée à partir de tes durées de cycle récentes.",
  "settings.sourceCode":
    "Code source (v{version}), s’ouvre dans un nouvel onglet",
  "settings.data": "Données",
  "settings.dataInfo": "À propos de l’import et de l’export",
  "settings.dataHelp":
    "L’export enregistre tes jours dans un fichier. L’import les remplace à partir d’une sauvegarde Tide, ou ajoute des jours depuis Clue ou Flo.",
  "settings.importSources":
    "Tu peux importer une sauvegarde Tide, ou un export de Clue ou Flo.",
  "settings.export": "Exporter",
  "settings.exportSuccess": "Sauvegarde enregistrée dans tes téléchargements.",
  "settings.exportCalendar": "Ajouter au calendrier",
  "settings.calendarHelp":
    "Enregistre tes 3 prochaines règles prévues dans un fichier que ton agenda peut ouvrir. Une fois ajoutées, elles se synchronisent comme tes autres événements, donc le compte de l’agenda les garde aussi.",
  "settings.calendarFertility": "Inclure les fenêtres de fertilité",
  "settings.calendarSuccess":
    "Fichier de calendrier enregistré dans tes téléchargements.",
  "settings.calendarError":
    "Impossible de créer le fichier de calendrier. Recharge Tide et réessaie.",
  "settings.import": "Importer",
  "settings.importFile": "Importer un fichier de données",
  "settings.importError":
    "Ce fichier n’est ni une sauvegarde Tide, ni un export Clue ou Flo.",
  "settings.importSuccess.one": "{n} jour enregistré importé.",
  "settings.importSuccess.other": "{n} jours enregistrés importés.",
  "settings.importConfirmTitle": "Remplacer tes données ?",
  "settings.importConfirmAction": "Remplacer",
  "settings.importFileDays.one": "Ce fichier contient {n} jour enregistré.",
  "settings.importFileDays.other": "Ce fichier contient {n} jours enregistrés.",
  "settings.importReplaces.one":
    "Il remplace le {n} jour enregistré sur cet appareil, sans retour possible.",
  "settings.importReplaces.other":
    "Il remplace les {n} jours enregistrés sur cet appareil, sans retour possible.",
  "settings.importMergeTitle": "Ajouter les jours de {source} ?",
  "settings.importMergeAction": "Ajouter",
  "settings.importMerges": "Les jours déjà enregistrés ici restent tels quels.",
  "settings.reset": "Supprimer toutes les données",
  "settings.resetTitle": "Supprimer toutes les données ?",
  "settings.resetAction": "Supprimer",
  "settings.resetConfirm":
    "Tous les jours enregistrés et les réglages de cet appareil sont effacés, sans retour possible.",
};
