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
    return "Fertility estimate: higher chance today";
  }

  return "Fertility estimate: lower chance today";
}
