import { DropletOff, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { FlowIntensity, IsoDate } from "../../domain/types";
import { useLocale, useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
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
  const pickerRef = useRef<HTMLDivElement>(null);
  const t = useT();
  const locale = useLocale();

  // Close when interacting outside the picker. Day buttons are left alone —
  // tapping one is already handled by the calendar's own selection logic.
  useEffect(() => {
    function handleOutside(event: PointerEvent) {
      const target = event.target as HTMLElement;
      if (
        pickerRef.current?.contains(target) ||
        target.closest(".calendar-grid")
      ) {
        return;
      }
      onClose();
    }
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [onClose]);

  return (
    <div className="day-flow-picker" ref={pickerRef}>
      <div className="day-flow-picker__head">
        <span className="day-flow-picker__date">
          {formatShortDate(day, locale)}
        </span>
        <button
          type="button"
          className="day-flow-picker__close"
          aria-label={t("common.close")}
          onClick={onClose}
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>
      <FlowGauge
        selected={intensity}
        onSelect={onSelect}
        name={`flow-${day}`}
        autoFocus
      />
      {isLogged ? (
        <button type="button" className="text-action" onClick={onRemove}>
          <AppIcon icon={DropletOff} className="text-action__icon" />
          {t("calendar.notBleeding")}
        </button>
      ) : null}
    </div>
  );
}
