import { useT } from "../../state/provider";
import { AboutSection } from "./AboutSection";
import { CycleNumbersSection } from "./CycleNumbersSection";
import { DataSection } from "./DataSection";
import { FertilitySection } from "./FertilitySection";
import { LanguageSection } from "./LanguageSection";
import { ThemeSection } from "./ThemeSection";

export function SettingsScreen() {
  const t = useT();
  return (
    <section className="utility-screen">
      <h1 className="visually-hidden">{t("settings.title")}</h1>
      <article className="utility-card">
        <h2 className="section-title">{t("settings.preferences")}</h2>
        <div className="settings-group settings-group--compact">
          <ThemeSection />
          <LanguageSection />
          <FertilitySection />
          <CycleNumbersSection />
        </div>
      </article>
      <DataSection />
      <AboutSection />
    </section>
  );
}
