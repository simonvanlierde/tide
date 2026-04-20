import type { AppSettings, AppState, HomeCardsSettings, HomeDisplayMode } from "../domain/types";

const STORAGE_KEY = "tide.period-tracker.state";

export const defaultAppState: AppState = {
  periodDays: [],
  settings: {
    reminderWindowDays: 4,
    snoozedUntil: null,
    homeDisplayMode: "summary",
    homeCards: {
      showNextPeriodCard: true,
      showPhaseCard: true,
      showFertilityCard: true
    }
  }
};

const HOME_DISPLAY_MODES: HomeDisplayMode[] = ["summary", "linear", "circular"];

function normalizeHomeCards(homeCards: unknown): HomeCardsSettings {
  const candidate =
    homeCards && typeof homeCards === "object" ? (homeCards as Partial<HomeCardsSettings>) : {};

  return {
    showNextPeriodCard:
      typeof candidate.showNextPeriodCard === "boolean"
        ? candidate.showNextPeriodCard
        : defaultAppState.settings.homeCards.showNextPeriodCard,
    showPhaseCard:
      typeof candidate.showPhaseCard === "boolean"
        ? candidate.showPhaseCard
        : defaultAppState.settings.homeCards.showPhaseCard,
    showFertilityCard:
      typeof candidate.showFertilityCard === "boolean"
        ? candidate.showFertilityCard
        : defaultAppState.settings.homeCards.showFertilityCard
  };
}

export function normalizeSettings(settings: unknown): AppSettings {
  const candidate = settings && typeof settings === "object" ? (settings as Partial<AppSettings>) : {};

  return {
    reminderWindowDays:
      typeof candidate.reminderWindowDays === "number"
        ? candidate.reminderWindowDays
        : defaultAppState.settings.reminderWindowDays,
    snoozedUntil:
      typeof candidate.snoozedUntil === "string" || candidate.snoozedUntil === null
        ? candidate.snoozedUntil
        : defaultAppState.settings.snoozedUntil,
    homeDisplayMode: HOME_DISPLAY_MODES.includes(candidate.homeDisplayMode as HomeDisplayMode)
      ? (candidate.homeDisplayMode as HomeDisplayMode)
      : defaultAppState.settings.homeDisplayMode,
    homeCards: normalizeHomeCards(candidate.homeCards)
  };
}

export function loadAppState(): AppState {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultAppState;
  }

  const parsed = JSON.parse(raw) as Partial<AppState>;

  return {
    periodDays: Array.isArray(parsed.periodDays) ? parsed.periodDays : defaultAppState.periodDays,
    settings: normalizeSettings(parsed.settings)
  };
}

export function saveAppState(state: AppState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
