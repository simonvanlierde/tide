import { useEffect, useRef } from "react";
import { FLOW_INTENSITIES } from "../../domain/flow";
import type { FlowIntensity, LoggedFlow } from "../../domain/types";
import { useT } from "../../state/provider";

interface FlowGaugeProps {
  /** Currently selected level, or undefined for a day with no chosen level. */
  selected?: LoggedFlow;
  onSelect: (intensity: FlowIntensity) => void;
  /** Radio group name — unique per gauge instance so multiple can coexist. */
  name?: string;
  /** Move focus onto the selected level when the gauge mounts, so arrow keys
   *  drive it immediately (e.g. the calendar picker opening). */
  autoFocus?: boolean;
  /** Keep the legend for screen readers only, where the swatches already say what they are. */
  hideLegend?: boolean;
}

// The tide gauge: four coral levels deepening spotting → heavy. Real radios
// under styled swatches, so keyboard and screen-reader selection come for free.
export function FlowGauge({
  selected,
  onSelect,
  name = "flow-intensity",
  autoFocus = false,
  hideLegend = false,
}: FlowGaugeProps) {
  const levelsRef = useRef<HTMLDivElement>(null);
  const t = useT();

  useEffect(() => {
    if (!autoFocus) {
      return;
    }
    const group = levelsRef.current;
    const target =
      group?.querySelector<HTMLInputElement>("input:checked") ?? group?.querySelector<HTMLInputElement>("input");
    target?.focus();
  }, [autoFocus]);

  return (
    <fieldset className="flow-gauge">
      <legend className={hideLegend ? "visually-hidden" : "flow-gauge__legend"}>{t("flow.legend")}</legend>
      <div className="flow-gauge__levels" ref={levelsRef}>
        {FLOW_INTENSITIES.map((level) => (
          <label
            key={level}
            className={`flow-gauge__level flow-gauge__level--${level}`}
            data-selected={selected === level}
          >
            <input
              type="radio"
              name={name}
              className="visually-hidden"
              checked={selected === level}
              // Chromium stops on a second radio of a group with none checked;
              // keep the group one Tab stop, arrows still move through it.
              tabIndex={selected || level === FLOW_INTENSITIES[0] ? undefined : -1}
              onChange={() => onSelect(level)}
            />
            <span className="flow-gauge__swatch" aria-hidden="true" />
            <span className="flow-gauge__label">{t(`flow.${level}`)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
