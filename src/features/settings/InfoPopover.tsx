import { Info } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { AppIcon } from "../../ui/icons";

interface InfoPopoverProps {
  /** Describes what the popover explains, for screen readers. */
  label: string;
  /** Which edge the panel anchors to; "start" opens rightward from a left-aligned trigger. */
  align?: "start" | "end";
  children: ReactNode;
}

const VIEWPORT_MARGIN = 8;

// A small "i" affordance that reveals helper text on tap or keyboard focus.
// Native <details> gives the toggle and keyboard support; the rest is added
// here: tap-outside-to-dismiss, and nudging the panel back into view (shift
// horizontally, flip above the trigger) when it would spill off-screen.
export function InfoPopover({
  label,
  align = "end",
  children,
}: InfoPopoverProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const reposition = useCallback(() => {
    const details = detailsRef.current;
    const content = contentRef.current;
    if (!details?.open || !content) return;

    // Start from the CSS-anchored position, then measure and correct.
    content.style.transform = "";
    content.classList.remove("info-popover__content--above");

    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    const rect = content.getBoundingClientRect();

    let shiftX = 0;
    if (rect.right > viewportWidth - VIEWPORT_MARGIN) {
      shiftX = viewportWidth - VIEWPORT_MARGIN - rect.right;
    }
    if (rect.left + shiftX < VIEWPORT_MARGIN) {
      shiftX = VIEWPORT_MARGIN - rect.left;
    }
    if (shiftX) {
      content.style.transform = `translateX(${Math.round(shiftX)}px)`;
    }

    // Flip above the trigger if opening downward runs past the bottom edge.
    if (rect.bottom > viewportHeight - VIEWPORT_MARGIN) {
      content.classList.add("info-popover__content--above");
    }
  }, []);

  useEffect(() => {
    function handleOutside(event: PointerEvent) {
      const details = detailsRef.current;
      if (details?.open && !details.contains(event.target as Node)) {
        details.open = false;
      }
    }
    document.addEventListener("pointerdown", handleOutside);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [reposition]);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Escape dismisses; the summary stays the operable toggle.
    <details
      ref={detailsRef}
      className={
        align === "start" ? "info-popover info-popover--start" : "info-popover"
      }
      onToggle={reposition}
      onKeyDown={(event) => {
        const details = detailsRef.current;
        if (event.key === "Escape" && details?.open) {
          event.stopPropagation();
          details.open = false;
          details.querySelector("summary")?.focus();
        }
      }}
    >
      <summary className="info-popover__trigger" aria-label={label}>
        <AppIcon icon={Info} className="info-popover__icon" />
      </summary>
      <div ref={contentRef} className="info-popover__content" role="note">
        {children}
      </div>
    </details>
  );
}
