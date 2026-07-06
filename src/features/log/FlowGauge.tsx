import { useEffect, useRef } from "react";
import { FLOW_INTENSITIES, FLOW_LABELS } from "../../domain/flow";
import type { FlowIntensity } from "../../domain/types";

interface FlowGaugeProps {
  /** Currently selected level, or undefined for a day with no chosen level. */
  selected?: FlowIntensity;
  onSelect: (intensity: FlowIntensity) => void;
  /** Radio group name — unique per gauge instance so multiple can coexist. */
  name?: string;
  /** Move focus onto the selected level when the gauge mounts, so arrow keys
   *  drive it immediately (e.g. the calendar picker opening). */
  autoFocus?: boolean;
}

// The tide gauge: four coral levels deepening spotting → heavy. Real radios
// under styled swatches, so keyboard and screen-reader selection come for free.
export function FlowGauge({
  selected,
  onSelect,
  name = "flow-intensity",
  autoFocus = false,
}: FlowGaugeProps) {
  const levelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }
    const group = levelsRef.current;
    const target =
      group?.querySelector<HTMLInputElement>("input:checked") ??
      group?.querySelector<HTMLInputElement>("input");
    target?.focus();
  }, [autoFocus]);

  return (
    <fieldset className="flow-gauge">
      <legend className="flow-gauge__legend">Flow</legend>
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
              onChange={() => onSelect(level)}
            />
            <span className="flow-gauge__swatch" aria-hidden="true" />
            <span className="flow-gauge__label">{FLOW_LABELS[level]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
