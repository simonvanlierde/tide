import { X } from "lucide-react";
import type { FlowIntensity, IsoDate } from "../../domain/types";
import { formatShortDate } from "../../utils/date";
import { FlowGauge } from "../log/FlowGauge";

interface DayFlowPickerProps {
  day: IsoDate;
  intensity?: FlowIntensity;
  isLogged: boolean;
  onSelect: (intensity: FlowIntensity) => void;
  onRemove: () => void;
  onClose: () => void;
}

// Picks (or backfills) the flow for one calendar day. Choosing a level logs the
// day if it wasn't already; "Not bleeding" clears it.
export function DayFlowPicker({
  day,
  intensity,
  isLogged,
  onSelect,
  onRemove,
  onClose,
}: DayFlowPickerProps) {
  return (
    <div className="day-flow-picker">
      <div className="day-flow-picker__head">
        <span className="day-flow-picker__date">{formatShortDate(day)}</span>
        <button
          type="button"
          className="day-flow-picker__close"
          aria-label="Close"
          onClick={onClose}
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>
      <FlowGauge
        selected={intensity}
        onSelect={onSelect}
        name={`flow-${day}`}
      />
      {isLogged ? (
        <button type="button" className="text-action" onClick={onRemove}>
          Not bleeding that day
        </button>
      ) : null}
    </div>
  );
}
