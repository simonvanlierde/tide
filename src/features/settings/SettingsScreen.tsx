import { AboutSection } from "./AboutSection";
import { DataSection } from "./DataSection";
import { FertilitySection } from "./FertilitySection";
import { ThemeSection } from "./ThemeSection";

export function SettingsScreen() {
  return (
    <section className="utility-screen">
      <h1 className="visually-hidden">Settings</h1>
      <article className="utility-card">
        <h2 className="section-title">Preferences</h2>
        <div className="settings-group settings-group--compact">
          <ThemeSection />
          <FertilitySection />
        </div>
      </article>
      <DataSection />
      <AboutSection />
    </section>
  );
}
