import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { AppIcon } from "../../ui/icons";

interface InfoPopoverProps {
  /** Describes what the popover explains, for screen readers. */
  label: string;
  children: ReactNode;
}

// A small "i" affordance that reveals helper text on tap or keyboard focus.
// Native <details> gives us the toggle, keyboard support, and light dismiss for
// free — same idiom the Today screen already uses.
export function InfoPopover({ label, children }: InfoPopoverProps) {
  return (
    <details className="info-popover">
      <summary className="info-popover__trigger" aria-label={label}>
        <AppIcon icon={Info} className="info-popover__icon" />
      </summary>
      <div className="info-popover__content" role="note">
        {children}
      </div>
    </details>
  );
}
