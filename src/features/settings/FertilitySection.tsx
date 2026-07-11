import { useAppState, useAppStateActions, useT } from "../../state/provider";
import { InfoPopover } from "./InfoPopover";

export function FertilitySection() {
  const state = useAppState();
  const actions = useAppStateActions();
  const t = useT();
  const current = state.settings.showFertility;

  return (
    <div className="settings-row">
      <span className="settings-label" id="fertility-label">
        {t("settings.showFertility")}
      </span>
      <div className="settings-row__controls">
        <InfoPopover label={t("settings.fertilityInfo")}>
          {t("settings.fertilityHelp")}
        </InfoPopover>
        <button
          type="button"
          role="switch"
          aria-checked={current}
          aria-labelledby="fertility-label"
          className="switch"
          onClick={() => actions.setShowFertility(!current)}
        />
      </div>
    </div>
  );
}
