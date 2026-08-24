import { DropletOff, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { FlowIntensity, IsoDate, LoggedFlow } from "../../domain/types";
import { useLocale, useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { formatShortDate } from "../../utils/date";
import { FlowGauge } from "../log/FlowGauge";

interface DayFlowPickerProps {
  day: IsoDate;
  intensity?: LoggedFlow;
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
  // The day button that opened the picker still has focus during the first
  // render (the gauge's autoFocus only lands on commit), so capture it here to
  // hand focus back on an explicit close.
  const openerRef = useRef(
    typeof document === "undefined"
      ? null
      : (document.activeElement as HTMLElement | null),
  );
  const t = useT();
  const locale = useLocale();

  // The picker renders below the grid; on short viewports it can land under
  // the tab bar. Bring it into view when it opens or moves to another day.
  // rAF, not immediate: layout has to settle first. Instant under reduced
  // motion via the a11y layer's scroll-behavior override.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      // Optional call: jsdom has no scrollIntoView.
      pickerRef.current?.scrollIntoView?.({
        block: "nearest",
        behavior: "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function closeAndRestoreFocus() {
    onClose();
    openerRef.current?.focus();
  }

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
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Escape is a dismiss shortcut layered over the close button below, which stays the operable control.
    // biome-ignore lint/a11y/noStaticElementInteractions: same.
    <div
      className="day-flow-picker inset-panel"
      ref={pickerRef}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          closeAndRestoreFocus();
        }
      }}
    >
      <div className="day-flow-picker__head">
        <span className="day-flow-picker__date">
          {formatShortDate(day, locale)}
        </span>
        <button
          type="button"
          className="icon-close"
          aria-label={t("common.close")}
          onClick={closeAndRestoreFocus}
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
