import type { CycleSummary } from "../../domain/types";

export function getNextPeriodSummary(daysUntil: number | null) {
  if (daysUntil === null) {
    return "Period estimate not available yet";
  }

  if (daysUntil < 0) {
    const daysAgo = Math.abs(daysUntil);
    return `Period expected ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
  }

  return `Period expected in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`;
}

export function getPhaseSentence(phaseLabel: string) {
  switch (phaseLabel) {
    case "menstrual":
      return "You are currently in the menstrual phase.";
    case "follicular":
      return "Currently in the follicular phase.";
    case "ovulation":
      return "Ovulation is likely around now.";
    case "luteal":
      return "Currently in the luteal phase.";
    default:
      return "Still learning your cycle from recent logs.";
  }
}

export function getFertilityEstimate(phaseLabel: string, fertile: boolean) {
  if (phaseLabel === "ovulation" || fertile) {
    return "Higher chance today";
  }

  return "Lower chance today";
}

export function getLearningNote(estimateMode: CycleSummary["estimateMode"]) {
  if (estimateMode === "fallback") {
    return "Learning from recent logs. Using a typical 28-day cycle for now.";
  }

  if (estimateMode === "insufficient") {
    return "Log bleeding days to start an estimate.";
  }

  return null;
}
