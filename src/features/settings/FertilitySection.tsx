import { useAppState, useAppStateActions } from "../../state/provider";

export function FertilitySection() {
  const state = useAppState();
  const actions = useAppStateActions();
  const current = state.settings.showFertility;

  return (
    <div className="settings-row">
      <span className="settings-label" id="fertility-label">
        Show fertility estimates
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={current}
        aria-labelledby="fertility-label"
        className="switch"
        onClick={() => actions.setShowFertility(!current)}
      />
      <p className="supporting-note settings-row__note">
        Shows fertile-window and ovulation estimates on the home screen and
        calendar.
      </p>
    </div>
  );
}
