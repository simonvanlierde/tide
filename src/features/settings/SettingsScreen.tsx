import { FertilitySection } from "./FertilitySection";
import { InformationSection } from "./InformationSection";
import { ThemeSection } from "./ThemeSection";

export function SettingsScreen() {
  return (
    <section className="utility-screen">
      <ThemeSection />
      <FertilitySection />
      <InformationSection />
    </section>
  );
}
