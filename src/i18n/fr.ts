import type { Dictionary } from "./en";

export const fr: Dictionary = {
  "nav.today": "Aujourd’hui",
  "nav.calendar": "Calendrier",
  "nav.settings": "Réglages",
  "app.skipToContent": "Aller au contenu",
  "app.primaryNav": "Navigation principale",

  "today.srCycleDay": "Jour du cycle {day}, {phase}",
  "today.nextPeriod": "Prochaines règles",
  "today.fertility": "Fertilité",
  "today.fertilityInfoLabel": "Comment la fertilité est estimée",
  "today.cycleInsights": "Aperçu du cycle",
  "today.notEnoughData": "Pas encore assez de données",
  "today.daysAgo.one": "il y a {n} jour",
  "today.daysAgo.other": "il y a {n} jours",
  "today.expectedToday": "Prévues aujourd’hui",
  "today.inDays.one": "dans {n} jour",
  "today.inDays.other": "dans {n} jours",
  "today.higherToday": "Plus élevée aujourd’hui",
  "today.lowerToday": "Plus faible aujourd’hui",
  "today.privacy": "Stocké uniquement sur cet appareil.",
  "today.fertilityUnclear": "Incertaine en retard",
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
    "Cycle type de 28 jours utilisé jusqu’à ce que votre rythme soit appris.",
  "today.learningInsufficient":
    "Enregistrez vos saignements pour lancer une estimation.",

  "phase.menstrual": "Menstruelle",
  "phase.follicular": "Folliculaire",
  "phase.ovulation": "Ovulation",
  "phase.luteal": "Lutéale",
  "phase.learning": "Apprentissage",
  "phaseLine.menstrual": "Phase menstruelle",
  "phaseLine.follicular": "Phase folliculaire",
  "phaseLine.ovulation": "Phase d’ovulation",
  "phaseLine.luteal": "Phase lutéale",
  "phaseLine.learning": "Apprentissage",
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
    "Basé sur un cycle type de {cycle} jours jusqu’à ce que vous ayez enregistré un cycle complet.",
  "insights.regularity": "Régularité du cycle",
  "insights.regularityAria": "Régularité du cycle : {label}",
  "regularity.none": "Pas encore assez de données",
  "regularity.veryRegular": "Très régulier",
  "regularity.regular": "Régulier",
  "regularity.somewhatVariable": "Un peu variable",
  "regularity.variable": "Variable",
  "insights.how": "Comment les prévisions fonctionnent",
  "insights.how1":
    "Tout est calculé sur votre appareil à partir des jours que vous enregistrez.",
  "insights.howCycleStart":
    "Un écart de {gap} jours ou plus entre deux jours enregistrés commence un nouveau cycle ; en dessous, ce sont les mêmes règles.",
  "insights.how2":
    "La durée du cycle est la médiane de vos {recent} derniers cycles, pour qu’un mois inhabituel ne la fausse pas. Avant deux cycles, un cycle type de {cycle} jours est utilisé.",
  "insights.how3":
    "La durée des règles est votre moyenne récente, limitée à une normale de {min} à {max} jours.",
  "insights.how4":
    "Vos prochaines règles correspondent à votre dernier début plus cette durée de cycle ; l’ovulation est estimée {luteal} jours avant.",
  "insights.how5":
    "La fenêtre de fertilité s’étend de {before} jours avant à {after} jour après l’ovulation, et s’élargit quand vos cycles varient davantage.",

  "legend.period": "Règles",
  "legend.expected": "Attendu",
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
    "Vos règles étaient prévues le {date}. Commencées ?",
  "reminder.messageUpcoming": "Vos règles sont prévues le {date}. Commencées ?",
  "reminder.dismiss": "Pas encore — me le rappeler plus tard",
  "reminder.reassure": "Quelques jours de variation, c’est courant.",

  "calendar.title": "Calendrier",
  "calendar.previousMonth": "Mois précédent",
  "calendar.nextMonth": "Mois suivant",
  "calendar.jumpToMonth": "Aller au mois",
  "calendar.month": "Mois",
  "calendar.year": "Année",
  "calendar.tapHelp":
    "Touchez un jour pour enregistrer ou modifier un saignement.",
  "calendar.today": "Aujourd’hui",
  "calendar.goToCurrentMonth": "Aller au mois actuel",
  "calendar.justLogged": "{date} enregistré.",
  "calendar.justLoggedForecast": "{date} enregistré. Prévision mise à jour.",
  "calendar.undo": "Annuler",
  "calendar.emptyHelp":
    "Touchez un jour passé pour enregistrer votre premier jour de saignement.",
  "calendar.futureHelp":
    "Les jours à venir ne peuvent pas encore être enregistrés.",
  "calendar.legend.logged": "Enregistré",
  "calendar.legend.predicted": "Prévu",
  "calendar.legend.fertile": "Fertile",
  "calendar.legend.ovulation": "Ovulation",
  "calendar.log": "Enregistrer",
  "calendar.edit": "Modifier",
  "calendar.dayUnavailable": "{label} indisponible",
  "calendar.dayWithMarker": "{label}, {marker}",
  "marker.fertile": "fenêtre de fertilité",
  "marker.ovulation": "ovulation probable",
  "marker.predictedPeriod": "règles prévues",
  "calendar.notBleeding": "Pas de saignement ce jour-là",

  "common.unknown": "inconnu",
  "common.close": "Fermer",
  "common.cancel": "Annuler",
  "common.days": "jours",

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
    "Affiche les estimations de la fenêtre de fertilité et de l’ovulation sur l’écran d’accueil et le calendrier.",
  "settings.showCycleNumbers": "Afficher les numéros de jour du cycle",
  "settings.cycleNumbersInfo": "À propos des numéros de jour du cycle",
  "settings.cycleNumbersHelp":
    "Numérote les jours de votre cycle actuel (1, 2, 3, ...) sur le calendrier, jusqu’à vos prochaines règles prévues.",
  "settings.about": "À propos",
  "settings.privacy": "Vos données ne quittent jamais cet appareil.",
  "settings.fertilityDisclaimer":
    "Les estimations de fertilité sont informatives et ne constituent pas une méthode de contraception.",
  "settings.fertilityMethod":
    "Plus élevée autour de votre ovulation prévue. Estimée à partir de vos durées de cycle récentes.",
  "settings.sourceCode":
    "Code source (v{version}), s’ouvre dans un nouvel onglet",
  "settings.data": "Données",
  "settings.dataInfo": "À propos de l’import et de l’export",
  "settings.dataHelp":
    "L’export enregistre vos jours dans un fichier. L’import les remplace à partir d’une sauvegarde.",
  "settings.export": "Exporter",
  "settings.exportSuccess": "Sauvegarde enregistrée dans vos téléchargements.",
  "settings.import": "Importer",
  "settings.importFile": "Importer un fichier de données",
  "settings.importError":
    "Ce fichier n’est pas une sauvegarde Tide valide. Utilisez un fichier JSON exporté depuis Tide.",
  "settings.importSuccess.one": "{n} jour enregistré importé.",
  "settings.importSuccess.other": "{n} jours enregistrés importés.",
  "settings.importConfirmTitle": "Remplacer vos données ?",
  "settings.importConfirmAction": "Remplacer",
  "settings.importFileDays.one":
    "Cette sauvegarde contient {n} jour enregistré.",
  "settings.importFileDays.other":
    "Cette sauvegarde contient {n} jours enregistrés.",
  "settings.importReplaces.one":
    "Elle remplace le {n} jour enregistré sur cet appareil, sans retour possible.",
  "settings.importReplaces.other":
    "Elle remplace les {n} jours enregistrés sur cet appareil, sans retour possible.",
  "settings.reset": "Supprimer toutes les données",
  "settings.resetTitle": "Supprimer toutes les données ?",
  "settings.resetAction": "Supprimer",
  "settings.resetConfirm":
    "Tous les jours enregistrés et les réglages de cet appareil sont effacés, sans retour possible.",
};
