import type { IsoDate } from "../../domain/types";
import { getTodayIsoDate } from "../../utils/date";
import { InformationSection } from "./InformationSection";
import { RemindersSection } from "./RemindersSection";

interface SettingsScreenProps {
  today?: IsoDate;
}

export function SettingsScreen({
  today = getTodayIsoDate(),
}: SettingsScreenProps) {
  return (
    <section className="utility-screen">
      <RemindersSection today={today} />
      <InformationSection />
    </section>
  );
}
