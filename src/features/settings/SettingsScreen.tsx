import type { IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions, useT } from "../../state/provider";
import { useToday } from "../../state/useToday";
import { AboutSection } from "./AboutSection";
import { DataSection } from "./DataSection";
import { LanguageSection } from "./LanguageSection";
import { SwitchRow } from "./SwitchRow";
import { ThemeSection } from "./ThemeSection";

interface SettingsScreenProps {
  today?: IsoDate;
}

export function SettingsScreen(props: SettingsScreenProps) {
  const liveToday = useToday();
  const today = props.today ?? liveToday;
  const { settings } = useAppState();
  const actions = useAppStateActions();
  const t = useT();
  return (
    <section className="utility-screen">
      <h1 className="visually-hidden">{t("settings.title")}</h1>
      <article className="utility-card">
        <h2 className="section-title">{t("settings.preferences")}</h2>
        <div className="settings-group settings-group--compact">
          <ThemeSection />
          <LanguageSection />
          <SwitchRow
            label={t("settings.showFertility")}
            infoLabel={t("settings.fertilityInfo")}
            help={t("settings.fertilityHelp")}
            checked={settings.showFertility === true}
            onChange={(show) => actions.setSetting("showFertility", show)}
          />
          <SwitchRow
            label={t("settings.showCycleNumbers")}
            infoLabel={t("settings.cycleNumbersInfo")}
            help={t("settings.cycleNumbersHelp")}
            checked={settings.showCycleDayNumbers}
            onChange={(show) =>
              // biome-ignore lint/security/noSecrets: a settings field name, not a credential
              actions.setSetting("showCycleDayNumbers", show)
            }
          />
        </div>
      </article>
      <DataSection today={today} />
      <AboutSection />
    </section>
  );
}
