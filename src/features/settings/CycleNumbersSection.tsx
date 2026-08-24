import { useAppState, useAppStateActions, useT } from "../../state/provider";
import { InfoPopover } from "./InfoPopover";

export function CycleNumbersSection() {
  const state = useAppState();
  const actions = useAppStateActions();
  const t = useT();
  const current = state.settings.showCycleDayNumbers;

  return (
    <div className="settings-row">
      <span className="settings-label" id="cycle-numbers-label">
        {t("settings.showCycleNumbers")}
        <InfoPopover label={t("settings.cycleNumbersInfo")} align="start">
          {t("settings.cycleNumbersHelp")}
        </InfoPopover>
      </span>
      <div className="settings-row__controls">
        <button
          type="button"
          role="switch"
          aria-checked={current}
          aria-labelledby="cycle-numbers-label"
          className="switch"
          onClick={() => actions.setShowCycleDayNumbers(!current)}
        />
      </div>
    </div>
  );
}
