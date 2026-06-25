import type { IsoDate } from "../../domain/types";
import { getTodayIsoDate } from "../../utils/date";
import { HomeSection } from "./HomeSection";
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
      <HomeSection />
      <RemindersSection today={today} />
      <InformationSection />
    </section>
  );
}
