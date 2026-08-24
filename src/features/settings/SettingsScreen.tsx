import { ShieldCheck } from "lucide-react";
import { useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
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
      {/* The reason this audience is here, answered before any control: a
          quiet chip, not a banner. */}
      <p className="privacy-chip">
        <AppIcon icon={ShieldCheck} className="privacy-chip__icon" />
        <span>{t("settings.privacy")}</span>
      </p>
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
