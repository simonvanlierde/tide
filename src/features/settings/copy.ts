export function getReminderSummary(
  daysUntilPeriod: number | null,
  reminderWindowDays: number,
) {
  if (daysUntilPeriod === null) {
    return "Next reminder will appear once your next cycle estimate is ready.";
  }

  const daysUntilReminder = daysUntilPeriod - reminderWindowDays;

  if (daysUntilReminder > 0) {
    return `Next reminder in ${daysUntilReminder} days.`;
  }

  if (daysUntilPeriod >= -1) {
    return "Reminder window is active now.";
  }

  return "Reminder window has passed for this cycle.";
}
