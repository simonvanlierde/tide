import type { Dictionary } from "./en";

export const es: Dictionary = {
  "nav.today": "Hoy",
  "nav.calendar": "Calendario",
  "nav.settings": "Ajustes",
  "app.skipToContent": "Saltar al contenido",
  "app.primaryNav": "Navegación principal",

  "today.srCycleDay": "Día del ciclo {day}, {phase}",
  "today.nextPeriod": "Próximo período",
  "today.fertility": "Fertilidad",
  "today.fertilityInfoLabel": "Cómo se estima la fertilidad",
  "today.cycleInsights": "Detalles del ciclo",
  "today.notEnoughData": "Aún no hay suficientes datos",
  "today.daysAgo.one": "hace {n} día",
  "today.daysAgo.other": "hace {n} días",
  "today.expectedToday": "Previsto hoy",
  "today.inDays.one": "en {n} día",
  "today.inDays.other": "en {n} días",
  "today.higherToday": "Más alta hoy",
  "today.lowerToday": "Más baja hoy",
  "today.ovulationDaysAgo.one": "Ovulación hace {n} día",
  "today.ovulationDaysAgo.other": "Ovulación hace {n} días",
  "today.ovulationToday": "Ovulación hoy",
  "today.ovulationInDays.one": "Ovulación en {n} día",
  "today.ovulationInDays.other": "Ovulación en {n} días",
  "today.learningFallback":
    "Se usa un ciclo típico de 28 días hasta que aprendamos tu patrón.",
  "today.learningInsufficient":
    "Registra el sangrado para empezar una estimación.",

  "phase.menstrual": "Menstrual",
  "phase.follicular": "Folicular",
  "phase.ovulation": "Ovulación",
  "phase.luteal": "Lútea",
  "phase.learning": "Aprendiendo",
  "phaseLine.menstrual": "Fase menstrual",
  "phaseLine.follicular": "Fase folicular",
  "phaseLine.ovulation": "Fase de ovulación",
  "phaseLine.luteal": "Fase lútea",
  "phaseLine.learning": "Aprendiendo",

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
  "insights.how2":
    "La duración del ciclo es la mediana de tus últimos {recent} ciclos, para que un mes atípico no la altere. Antes de dos ciclos, se usa un ciclo típico de {cycle} días.",
  "insights.how3":
    "La duración del período es tu promedio reciente, limitado a unos {min}–{max} días normales.",
  "insights.how4":
    "Tu próximo período es tu último inicio más esa duración del ciclo; la ovulación se estima {luteal} días antes.",
  "insights.how5":
    "La ventana fértil va de {before} días antes a {after} día después de la ovulación, y se amplía cuando tus ciclos varían más.",

  "legend.period": "Período",
  "legend.fertileWindow": "Ventana fértil",
  "legend.ovulation": "Ovulación",

  "flow.legend": "Flujo",
  "flow.spotting": "Manchado",
  "flow.light": "Ligero",
  "flow.medium": "Moderado",
  "flow.heavy": "Abundante",

  "log.remove": "Eliminar registro de sangrado",
  "log.add": "Registrar sangrado de hoy",
  "reminder.messageOverdue":
    "Tu período estaba previsto el {date}. ¿Ha comenzado?",
  "reminder.messageUpcoming":
    "Tu período está previsto el {date}. ¿Ha comenzado?",
  "reminder.dismiss": "Todavía no — recordármelo más tarde",

  "calendar.title": "Calendario",
  "calendar.previousMonth": "Mes anterior",
  "calendar.nextMonth": "Mes siguiente",
  "calendar.jumpToMonth": "Ir al mes",
  "calendar.month": "Mes",
  "calendar.year": "Año",
  "calendar.tapHelp": "Toca un día para registrar o editar el sangrado.",
  "calendar.today": "Hoy",
  "calendar.goToCurrentMonth": "Ir al mes actual",
  "calendar.noDays": "Aún no hay días de sangrado registrados.",
  "calendar.legend.logged": "Registrado",
  "calendar.legend.predicted": "Previsto",
  "calendar.legend.fertile": "Fértil",
  "calendar.legend.ovulation": "Ovulación",
  "calendar.log": "Registrar",
  "calendar.edit": "Editar",
  "calendar.dayUnavailable": "{label} no disponible",
  "calendar.dayWithMarker": "{label}, {marker}",
  "marker.fertile": "ventana fértil",
  "marker.ovulation": "ovulación probable",
  "marker.predictedPeriod": "período previsto",
  "calendar.notBleeding": "Sin sangrado ese día",

  "common.unknown": "desconocido",
  "common.close": "Cerrar",
  "common.days": "días",

  "settings.title": "Ajustes",
  "settings.preferences": "Preferencias",
  "settings.theme": "Tema",
  "theme.system": "Sistema",
  "theme.light": "Claro",
  "theme.dark": "Oscuro",
  "settings.language": "Idioma",
  "language.system": "Sistema",
  "language.en": "English",
  "language.nl": "Nederlands",
  "language.de": "Deutsch",
  "language.fr": "Français",
  "language.es": "Español",
  "settings.showFertility": "Mostrar estimaciones de fertilidad",
  "settings.fertilityInfo": "Acerca de las estimaciones de fertilidad",
  "settings.fertilityHelp":
    "Muestra estimaciones de la ventana fértil y la ovulación en la pantalla de inicio y el calendario.",
  "settings.showCycleNumbers": "Mostrar números de día del ciclo",
  "settings.cycleNumbersInfo": "Acerca de los números de día del ciclo",
  "settings.cycleNumbersHelp":
    "Numera los días de tu ciclo actual (1, 2, 3, ...) en el calendario, hasta tu próximo período previsto.",
  "settings.about": "Acerca de",
  "settings.privacy": "Tus datos nunca salen de este dispositivo.",
  "settings.fertilityDisclaimer":
    "Las estimaciones de fertilidad son informativas, no un método anticonceptivo.",
  "settings.fertilityMethod":
    "Más alta alrededor de tu ovulación prevista. Estimada a partir de tus duraciones de ciclo recientes.",
  "settings.sourceCode":
    "Código fuente (v{version}), se abre en una pestaña nueva",
  "settings.data": "Datos",
  "settings.dataInfo": "Acerca de importar y exportar",
  "settings.dataHelp":
    "Exportar guarda tus días en un archivo. Importar los reemplaza desde una copia de seguridad.",
  "settings.export": "Exportar",
  "settings.import": "Importar",
  "settings.importFile": "Importar archivo de datos",
  "settings.importError":
    "Ese archivo no es una copia de seguridad de Tide válida.",
  "settings.importConfirm":
    "Importar reemplaza todo lo registrado en este dispositivo. ¿Continuar?",
  "settings.reset": "Borrar todos los datos",
  "settings.resetConfirm":
    "¿Borrar cada día registrado y restablecer los ajustes en este dispositivo? Esta acción no se puede deshacer.",
};
