import { useAppState, useAppStateActions } from "../../state/provider";
import { SETTINGS_HELP } from "./config";
import { InfoPopover } from "./InfoPopover";

export function PeriodNumbersSection() {
  const state = useAppState();
  const actions = useAppStateActions();
  const current = state.settings.showPeriodDayNumbers;

  return (
    <div className="settings-row">
      <span className="settings-label" id="period-numbers-label">
        Show period day numbers
      </span>
      <div className="settings-row__controls">
        <InfoPopover label="About period day numbers">
          {SETTINGS_HELP.periodDayNumbers}
        </InfoPopover>
        <button
          type="button"
          role="switch"
          aria-checked={current}
          aria-labelledby="period-numbers-label"
          className="switch"
          onClick={() => actions.setShowPeriodDayNumbers(!current)}
        />
      </div>
    </div>
  );
}
