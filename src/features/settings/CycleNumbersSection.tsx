import { useAppState, useAppStateActions } from "../../state/provider";
import { SETTINGS_HELP } from "./config";
import { InfoPopover } from "./InfoPopover";

export function CycleNumbersSection() {
  const state = useAppState();
  const actions = useAppStateActions();
  const current = state.settings.showCycleDayNumbers;

  return (
    <div className="settings-row">
      <span className="settings-label" id="cycle-numbers-label">
        Show cycle day numbers
      </span>
      <div className="settings-row__controls">
        <InfoPopover label="About cycle day numbers">
          {SETTINGS_HELP.cycleDayNumbers}
        </InfoPopover>
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
