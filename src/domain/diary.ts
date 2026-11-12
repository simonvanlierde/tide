export const SYMPTOMS = ["cramps", "headache", "bloating", "breastTenderness", "fatigue"] as const;
export const MOODS = ["low", "okay", "good"] as const;
export const MAX_NOTE_LENGTH = 1000;

type Symptom = (typeof SYMPTOMS)[number];
type Mood = (typeof MOODS)[number];

export interface DailyDetails {
  /** null means none logged. Never empty: an old backup's explicit "No symptoms" ([]) loads as null. */
  symptoms: Symptom[] | null;
  mood: Mood | null;
  note: string;
}

export function normalizeDailyDetails(value: unknown): DailyDetails | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Partial<DailyDetails>;
  if (
    (candidate.symptoms !== null &&
      (!Array.isArray(candidate.symptoms) || !candidate.symptoms.every((symptom) => SYMPTOMS.includes(symptom)))) ||
    (candidate.mood !== null && !MOODS.includes(candidate.mood as Mood)) ||
    typeof candidate.note !== "string" ||
    candidate.note.length > MAX_NOTE_LENGTH
  )
    return undefined;
  return {
    symptoms: candidate.symptoms === null || candidate.symptoms.length === 0 ? null : [...new Set(candidate.symptoms)],
    mood: candidate.mood as Mood | null,
    note: candidate.note,
  };
}

export function hasDailyDetails(details: DailyDetails): boolean {
  return details.symptoms !== null || details.mood !== null || details.note !== "";
}
