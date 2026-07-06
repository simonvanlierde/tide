import { AboutSection } from "./AboutSection";
import { FertilitySection } from "./FertilitySection";
import { InformationSection } from "./InformationSection";
import { ThemeSection } from "./ThemeSection";

export function SettingsScreen() {
  return (
    <section className="utility-screen">
      <h1 className="visually-hidden">Settings</h1>
      <ThemeSection />
      <FertilitySection />
      <InformationSection />
      <AboutSection />
    </section>
  );
}
