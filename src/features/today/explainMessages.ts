import type { SupportedLanguage } from "../../i18n";

// Words for the forecast explainer, kept out of the main dictionaries so
// they load with the sheet instead of with the app. English is the base;
// every other language must cover the same keys.
const en = {
  "explain.cycles": "Cycles used for this estimate, oldest first: {list} days.",
  "explain.median": "Their median (middle value) is {cycle} days.",
  "explain.medianRounded": "Their median (middle value) is {median}, rounded to {cycle} days.",
  "explain.fallback": "No complete cycles are available for this estimate, so a typical {cycle}-day cycle is used.",
  "explain.next": "Your last period started {start}. Adding {cycle} days gives {date}.",
  "explain.range.one":
    "Past variation: about {spread} day. Estimated range: {from} to {to}. Your period may start outside it.",
  "explain.range.other":
    "Past variation: about {spread} days. Estimated range: {from} to {to}. Your period may start outside it.",
  "explain.noRange": "A range needs at least two full cycles that are not marked incomplete.",
  "explain.sameLength": "Your recent cycles were all the same length, so there is no range.",
  "explain.ovulation": "Ovulation is estimated {luteal} days before that: {date}.",
  "explain.fertile": "The fertile window runs from {before} days before to {after} after it: {from} to {to}.",
  "explain.widened.one": "That is {n} day wider on each side, because your cycles vary.",
  "explain.widened.other": "That is {n} days wider on each side, because your cycles vary.",
} as const;

type ExplainKey = keyof typeof en;

export const EXPLAIN_MESSAGES: Record<SupportedLanguage, Record<ExplainKey, string>> = {
  en,
  de: {
    "explain.cycles": "Zyklen für diese Schätzung, der älteste zuerst: {list} Tage.",
    "explain.median": "Ihr Median (der mittlere Wert) ist {cycle} Tage.",
    "explain.medianRounded": "Ihr Median (der mittlere Wert) ist {median}, gerundet {cycle} Tage.",
    "explain.fallback":
      "Für diese Schätzung sind keine vollständigen Zyklen verfügbar. Daher gilt ein typischer Zyklus von {cycle} Tagen.",
    "explain.next": "Deine letzte Periode begann am {start}. Plus {cycle} Tage ergibt den {date}.",
    "explain.range.one":
      "Bisherige Schwankung: etwa {spread} Tag. Geschätzte Spanne: {from} bis {to}. Deine Periode kann auch außerhalb beginnen.",
    "explain.range.other":
      "Bisherige Schwankung: etwa {spread} Tage. Geschätzte Spanne: {from} bis {to}. Deine Periode kann auch außerhalb beginnen.",
    "explain.noRange":
      "Für eine Spanne braucht es mindestens zwei vollständige Zyklen, die nicht als unvollständig markiert sind.",
    "explain.sameLength": "Deine letzten Zyklen waren alle gleich lang, daher gibt es keine Spanne.",
    "explain.ovulation": "Der Eisprung wird {luteal} Tage davor geschätzt: {date}.",
    "explain.fertile": "Das fruchtbare Fenster reicht von {before} Tagen davor bis {after} danach: {from} bis {to}.",
    "explain.widened.one": "Es ist auf jeder Seite {n} Tag breiter, weil deine Zyklen schwanken.",
    "explain.widened.other": "Es ist auf jeder Seite {n} Tage breiter, weil deine Zyklen schwanken.",
  },
  fr: {
    "explain.cycles": "Cycles utilisés pour cette estimation, du plus ancien au plus récent : {list} jours.",
    "explain.median": "Leur médiane (valeur du milieu) est de {cycle} jours.",
    "explain.medianRounded": "Leur médiane (valeur du milieu) est de {median}, arrondie à {cycle} jours.",
    "explain.fallback":
      "Aucun cycle complet n’est disponible pour cette estimation. Un cycle type de {cycle} jours est donc utilisé.",
    "explain.next": "Tes dernières règles ont commencé le {start}. Plus {cycle} jours donne le {date}.",
    "explain.range.one":
      "Variation passée : environ {spread} jour. Plage estimée : du {from} au {to}. Tes règles peuvent commencer en dehors de cette plage.",
    "explain.range.other":
      "Variation passée : environ {spread} jours. Plage estimée : du {from} au {to}. Tes règles peuvent commencer en dehors de cette plage.",
    "explain.noRange": "Une plage demande au moins deux cycles complets qui ne sont pas marqués comme incomplets.",
    "explain.sameLength": "Tes derniers cycles avaient tous la même durée, il n’y a donc pas de plage.",
    "explain.ovulation": "L’ovulation est estimée {luteal} jours avant : le {date}.",
    "explain.fertile": "La fenêtre de fertilité va de {before} jours avant à {after} après : du {from} au {to}.",
    "explain.widened.one": "Elle est plus large de {n} jour de chaque côté, car tes cycles varient.",
    "explain.widened.other": "Elle est plus large de {n} jours de chaque côté, car tes cycles varient.",
  },
  nl: {
    "explain.cycles": "Cycli voor deze schatting, oudste eerst: {list} dagen.",
    "explain.median": "De mediaan (middelste waarde) is {cycle} dagen.",
    "explain.medianRounded": "De mediaan (middelste waarde) is {median}, afgerond {cycle} dagen.",
    "explain.fallback":
      "Er zijn geen volledige cycli beschikbaar voor deze schatting. Daarom geldt een gebruikelijke cyclus van {cycle} dagen.",
    "explain.next": "Je laatste menstruatie begon op {start}. Plus {cycle} dagen geeft {date}.",
    "explain.range.one":
      "Eerdere variatie: ongeveer {spread} dag. Geschatte marge: {from} tot {to}. Je menstruatie kan ook daarbuiten beginnen.",
    "explain.range.other":
      "Eerdere variatie: ongeveer {spread} dagen. Geschatte marge: {from} tot {to}. Je menstruatie kan ook daarbuiten beginnen.",
    "explain.noRange":
      "Voor een marge zijn minstens twee volledige cycli nodig die niet als onvolledig zijn gemarkeerd.",
    "explain.sameLength": "Je laatste cycli waren allemaal even lang, dus er is geen marge.",
    "explain.ovulation": "De eisprong wordt {luteal} dagen daarvoor geschat: {date}.",
    "explain.fertile": "De vruchtbare periode loopt van {before} dagen ervoor tot {after} erna: {from} tot {to}.",
    "explain.widened.one": "Die is aan elke kant {n} dag breder, omdat je cycli verschillen.",
    "explain.widened.other": "Die is aan elke kant {n} dagen breder, omdat je cycli verschillen.",
  },
  es: {
    "explain.cycles": "Ciclos usados para esta estimación, del más antiguo al más reciente: {list} días.",
    "explain.median": "Su mediana (el valor central) es de {cycle} días.",
    "explain.medianRounded": "Su mediana (el valor central) es {median}, redondeada a {cycle} días.",
    "explain.fallback":
      "No hay ciclos completos disponibles para esta estimación, así que se usa un ciclo típico de {cycle} días.",
    "explain.next": "Tu último período empezó el {start}. Sumando {cycle} días sale el {date}.",
    "explain.range.one":
      "Variación pasada: aproximadamente {spread} día. Margen estimado: del {from} al {to}. Tu período puede empezar fuera de este margen.",
    "explain.range.other":
      "Variación pasada: aproximadamente {spread} días. Margen estimado: del {from} al {to}. Tu período puede empezar fuera de este margen.",
    "explain.noRange": "Un margen necesita al menos dos ciclos completos que no estén marcados como incompletos.",
    "explain.sameLength": "Tus últimos ciclos duraron lo mismo, así que no hay margen.",
    "explain.ovulation": "La ovulación se estima {luteal} días antes: el {date}.",
    "explain.fertile": "La ventana fértil va de {before} días antes a {after} después: del {from} al {to}.",
    "explain.widened.one": "Es {n} día más ancha por cada lado, porque tus ciclos varían.",
    "explain.widened.other": "Es {n} días más ancha por cada lado, porque tus ciclos varían.",
  },
};
