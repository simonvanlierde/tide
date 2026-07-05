import type { IsoDate } from "../../domain/types";
import { getTodayIsoDate } from "../../utils/date";
import { InformationSection } from "./InformationSection";
import { RemindersSection } from "./RemindersSection";
import { ThemeSection } from "./ThemeSection";

interface SettingsScreenProps {
  today?: IsoDate;
}

export function SettingsScreen({
  today = getTodayIsoDate(),
}: SettingsScreenProps) {
  return (
    <section className="utility-screen">
      <ThemeSection />
      <RemindersSection today={today} />
      <InformationSection />
    </section>
  );
}
