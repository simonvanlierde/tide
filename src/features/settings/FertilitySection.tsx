import { useAppState, useAppStateActions } from "../../state/provider";
import { SETTINGS_HELP } from "./config";
import { InfoPopover } from "./InfoPopover";

export function FertilitySection() {
  const state = useAppState();
  const actions = useAppStateActions();
  const current = state.settings.showFertility;

  return (
    <div className="settings-row">
      <span className="settings-label" id="fertility-label">
        Show fertility estimates
      </span>
      <div className="settings-row__controls">
        <InfoPopover label="About fertility estimates">
          {SETTINGS_HELP.fertility}
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
