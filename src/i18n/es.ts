import type { Dictionary } from "./en";

export const es: Dictionary = {
  "nav.today": "Hoy",
  "nav.calendar": "Calendario",
  "nav.settings": "Ajustes",
  "app.skipToContent": "Saltar al contenido",
  "app.primaryNav": "Navegación principal",
  "app.newerData":
    "Una versión más reciente de Tide guardó tus datos. Recarga para actualizar; los cambios hechos aquí no se guardan.",

  "today.srCycleDay": "Día del ciclo {day}, {phase}",
  "today.nextPeriod": "Próximo período",
  "today.fertility": "Fertilidad",
  "today.fertilityInfoLabel": "Cómo se estima la fertilidad",
  "today.cycleInsights": "Detalles del ciclo",
  "today.howWorkedOut": "¿Cómo se ha calculado?",
  "today.explainError":
    "No se ha podido abrir. Vuelve a cargar Tide e inténtalo de nuevo.",
  "today.daysAgo.one": "hace {n} día",
  "today.daysAgo.other": "hace {n} días",
  "today.expectedToday": "Previsto hoy",
  "today.inDays.one": "En {n} día",
  "today.inDays.other": "En {n} días",
  "today.higherToday": "En la ventana fértil (estimación)",
  "today.lowerToday": "Fuera de la ventana fértil (estimación)",
  "today.notBirthControl": "No es un método anticonceptivo",
  "fertilityAsk.title": "¿Mostrar estimaciones de fertilidad?",
  "fertilityAsk.body":
    "Tide puede marcar los días en que es más probable que seas fértil, calculados a partir de los períodos que registras. Es una estimación, no un método anticonceptivo. Puedes cambiarlo en Ajustes.",
  "fertilityAsk.show": "Mostrar",
  "fertilityAsk.hide": "No mostrar",
  "today.privacy": "Guardado solo en este dispositivo.",
  "today.importPrompt":
    "¿Tienes una copia de seguridad de Tide o tu historial de Clue o Flo?",
  "today.importLink": "Importar",
  "today.fertilityUnclear": "Incierta con retraso",
  "today.periodLate": "Regla",
  "today.daysLate.one": "{n} día de retraso",
  "today.daysLate.other": "{n} días de retraso",
  "today.expectedOn": "Prevista {date}",
  "today.ovulationDaysAgo.one": "Ovulación hace {n} día",
  "today.ovulationDaysAgo.other": "Ovulación hace {n} días",
  "today.ovulationToday": "Ovulación hoy",
  "today.ovulationInDays.one": "Ovulación en {n} día",
  "today.ovulationInDays.other": "Ovulación en {n} días",
  "today.learningFallback":
    "Usaremos un ciclo típico de 28 días hasta conocer tu patrón.",
  "today.learningInsufficient": "Registra tu período para ver una previsión.",

  "phase.menstrual": "Menstrual",
  "phase.follicular": "Folicular",
  "phase.ovulation": "Ovulación",
  "phase.luteal": "Lútea",
  "phase.learning": "Aprendiendo",
  "phase.between": "Entre períodos",
  "phaseLine.menstrual": "Fase menstrual",
  "phaseLine.follicular": "Fase folicular",
  "phaseLine.ovulation": "Fase de ovulación",
  "phaseLine.luteal": "Fase lútea",
  "phaseLine.learning": "Aprendiendo",
  "phaseLine.between": "Entre períodos",
  "phaseLine.late": "Regla prevista",

  "dial.overview": "Resumen del ciclo",
  "dial.days": "Días del ciclo",
  "dial.cycleDay": "Día del ciclo",
  "dial.day": "Día {n}",
  "status.period": "Período",
  "status.ovulationExpected": "Ovulación prevista",
  "status.fertileWindow": "Ventana fértil",
  "status.periodExpected": "Período previsto",

  "insights.title": "Detalles del ciclo",
  "insights.cycleLength": "Duración del ciclo",
  "insights.periodLength": "Duración del período",
  "insights.cyclesTracked": "Ciclos registrados",
  "insights.basedOn":
    "Basado en un ciclo típico de {cycle} días hasta que registres un ciclo completo.",
  "insights.regularity": "Regularidad del ciclo",
  "insights.regularityAria": "Regularidad del ciclo: {label}",
  "regularity.none": "Aún no hay suficientes datos",
  "regularity.veryRegular": "Muy regular",
  "regularity.regular": "Regular",
  "regularity.somewhatVariable": "Algo variable",
  "regularity.variable": "Variable",
  "insights.how": "Cómo funcionan las predicciones",
  "insights.how1":
    "Todo se calcula en tu dispositivo a partir de los días que registras.",
  "insights.howCycleStart":
    "Un intervalo de {gap} días o más entre días registrados inicia un ciclo nuevo; los intervalos menores son la misma regla.",
  "insights.how2":
    "La duración del ciclo es la mediana de tus últimos {recent} ciclos, para que un mes atípico no la altere. Antes de dos ciclos, se usa un ciclo típico de {cycle} días.",
  "insights.how3":
    "La duración del período es tu promedio reciente, limitado a unos {min}–{max} días normales.",
  "insights.how4":
    "Tu próximo período es el inicio de tu último período más esa duración del ciclo; la ovulación se estima {luteal} días antes.",
  "insights.howNextPeriod":
    "Tu próximo período es el inicio de tu último período más esa duración del ciclo.",
  "insights.how5":
    "La ventana fértil va de {before} días antes a {after} día después de la ovulación, y se amplía cuando tus ciclos varían más.",

  "legend.period": "Período",
  "legend.expected": "Período previsto",
  "legend.fertileWindow": "Ventana fértil",
  "legend.ovulation": "Ovulación",

  "flow.legend": "Flujo",
  "flow.spotting": "Manchado",
  "flow.light": "Ligero",
  "flow.medium": "Moderado",
  "flow.heavy": "Abundante",

  "log.remove": "Eliminar registro de sangrado",
  "log.logged": "Registrado hoy",
  "log.loggedWith": "Registrado hoy · {flow}",
  "log.add": "Registrar sangrado de hoy",
  "reminder.messageOverdue":
    "Tu período estaba previsto el {date}. ¿Ha comenzado?",
  "reminder.messageUpcoming":
    "Tu período está previsto el {date}. ¿Ha comenzado?",
  "reminder.dismiss": "Todavía no — recordármelo más tarde",
  "reminder.reassure": "Unos días de variación es normal.",

  "calendar.title": "Calendario",
  "calendar.previousMonth": "Mes anterior",
  "calendar.nextMonth": "Mes siguiente",
  "calendar.jumpToMonth": "Ir al mes",
  "calendar.month": "Mes",
  "calendar.year": "Año",
  "calendar.tapHelp": "Toca un día para registrar o editar el sangrado.",
  "calendar.today": "Hoy",
  "calendar.goToCurrentMonth": "Ir al mes actual",
  "calendar.justLogged": "{date} registrado.",
  "calendar.justLoggedForecast": "{date} registrado. Previsión actualizada.",
  "calendar.undo": "Deshacer",
  "calendar.logRange": "Registrar un período pasado",
  "calendar.rangePickFirst": "Elige el primer día del período.",
  "calendar.rangePickLast":
    "Desde el {date}: elige el último día, como máximo {max} días.",
  "calendar.rangeTooLong":
    "Más de {max} días. Elige un último día más cercano.",
  "calendar.emptyHelp":
    "Toca un día pasado para registrar tu primer día de sangrado.",
  "calendar.futureHelp": "Los días futuros aún no se pueden registrar.",
  "calendar.log": "Registrar",
  "calendar.edit": "Editar",
  "calendar.dayUnavailable": "{label} no disponible",
  "calendar.dayWithMarker": "{label}, {marker}",
  "marker.fertile": "ventana fértil",
  "marker.ovulation": "ovulación prevista",
  "marker.predictedPeriod": "período previsto",
  "calendar.notBleeding": "Sin sangrado ese día",

  "common.unknown": "desconocido",
  "common.close": "Cerrar",
  "common.cancel": "Cancelar",
  "common.days": "días",
  "common.reload": "Recargar",

  // Crash screen
  "error.title": "Algo salió mal",
  "error.body": "Tus días registrados siguen guardados en este dispositivo.",
  "error.downloadRaw": "Descargar datos sin procesar",

  "settings.title": "Ajustes",
  "settings.preferences": "Preferencias",
  "settings.theme": "Tema",
  "theme.system": "Sistema",
  "theme.light": "Claro",
  "theme.dark": "Oscuro",
  "settings.language": "Idioma",
  "language.system": "Idioma del dispositivo",
  "language.en": "English",
  "language.nl": "Nederlands",
  "language.de": "Deutsch",
  "language.fr": "Français",
  "language.es": "Español",
  "settings.showFertility": "Mostrar estimaciones de fertilidad",
  "settings.fertilityInfo": "Acerca de las estimaciones de fertilidad",
  "settings.fertilityHelp":
    "Muestra la ventana fértil y la ovulación prevista en Hoy y en el calendario.",
  "settings.showCycleNumbers": "Mostrar números de día del ciclo",
  "settings.cycleNumbersInfo": "Acerca de los números de día del ciclo",
  "settings.cycleNumbersHelp":
    "Numera los días de tu ciclo actual (1, 2, 3, ...) en el calendario, hasta tu próximo período previsto.",
  "settings.about": "Acerca de",
  "settings.privacy": "Tus datos nunca salen de este dispositivo.",
  "settings.fertilityDisclaimer":
    "Las estimaciones de fertilidad son solo informativas. No son un método anticonceptivo.",
  "settings.fertilityMethod":
    "La ventana fértil son los días alrededor de tu ovulación prevista, estimada a partir de tus duraciones de ciclo recientes.",
  "settings.sourceCode":
    "Código fuente (v{version}), se abre en una pestaña nueva",
  "settings.data": "Datos",
  "settings.dataInfo": "Acerca de importar y exportar",
  "settings.dataHelp":
    "Exportar guarda tus días en un archivo. Importar los reemplaza desde una copia de seguridad de Tide, o añade días desde Clue o Flo.",
  "settings.importSources":
    "Puedes importar una copia de seguridad de Tide o una exportación de Clue o Flo.",
  "settings.export": "Exportar",
  "settings.exportSuccess": "Copia de seguridad guardada en tus descargas.",
  "settings.exportCalendar": "Añadir al calendario",
  "settings.calendarHelp":
    "Guarda tus 3 próximos períodos previstos en un archivo que tu app de calendario puede abrir. Una vez añadidos, se sincronizan como tus otros eventos, así que la cuenta del calendario también los guarda.",
  "settings.calendarFertility": "Incluir ventanas fértiles",
  "settings.calendarSuccess":
    "Archivo de calendario guardado en tus descargas.",
  "settings.calendarError":
    "No se ha podido crear el archivo de calendario. Vuelve a cargar Tide e inténtalo de nuevo.",
  "settings.import": "Importar",
  "settings.importFile": "Importar archivo de datos",
  "settings.importError":
    "Ese archivo no es una copia de seguridad de Tide ni una exportación de Clue o Flo.",
  "settings.importSuccess.one": "{n} día registrado importado.",
  "settings.importSuccess.other": "{n} días registrados importados.",
  "settings.importConfirmTitle": "¿Reemplazar tus datos?",
  "settings.importConfirmAction": "Reemplazar",
  "settings.importFileDays.one": "Este archivo contiene {n} día registrado.",
  "settings.importFileDays.other":
    "Este archivo contiene {n} días registrados.",
  "settings.importReplaces.one":
    "Reemplaza el {n} día registrado en este dispositivo y no se puede deshacer.",
  "settings.importReplaces.other":
    "Reemplaza los {n} días registrados en este dispositivo y no se puede deshacer.",
  "settings.importMergeTitle": "¿Añadir los días de {source}?",
  "settings.importMergeAction": "Añadir",
  "settings.importMerges": "Los días ya registrados aquí se quedan como están.",
  "settings.reset": "Borrar todos los datos",
  "settings.resetTitle": "¿Eliminar todos los datos?",
  "settings.resetAction": "Eliminar",
  "settings.resetConfirm":
    "Se borran todos los días registrados y los ajustes de este dispositivo. No se puede deshacer.",
};
