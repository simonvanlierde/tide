import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from "react";
import { dayAngleDeg, dayIndexFromPoint, pointerAngleDeg } from "./dialGeometry";

export const prefersMotion = () =>
  typeof window !== "undefined" && !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

interface DialScrubInput {
  /** Day cells on the ring, the expected-period nub included. */
  totalCells: number;
  /** Last cell a preview can reach. */
  maxIndex: number;
  /** Index of today's cell, or -1 without one. */
  currentIndex: number;
  /** Today's marker angle, where the ghost glides back to. */
  rotation: number;
}

/**
 * Preview state for the dial: dragging a finger or pressing the arrow keys
 * shows another day without saving anything. Returns the frame ref, the
 * previewed cell, the ghost marker's angles and the handlers for the frame.
 */
export function useDialScrub({ totalCells, maxIndex, currentIndex, rotation }: DialScrubInput) {
  const frameRef = useRef<HTMLDivElement>(null);
  // The cycle day being previewed while scrubbing (null: the live view) and
  // the exact pointer angle, so the ghost dot tracks the finger rather than
  // snapping to the day centre (null for keyboard previews). One state object:
  // a pointermove updates both in a single render.
  const [previewState, setPreviewState] = useState<{
    index: number | null;
    angle: number | null;
  }>({ index: null, angle: null });
  const previewIndex = previewState.index;
  const previewAngle = previewState.angle;
  // The ring's geometry is constant for the length of a drag; measure once on
  // pointerdown instead of forcing layout on every move.
  const dragRect = useRef<DOMRect | null>(null);
  // After a scrub the ghost glides from the finger back to today: the angle it
  // starts from, then (moving) today's angle with a CSS transition.
  const [settle, setSettle] = useState<{ angle: number; moving: boolean } | null>(null);

  // Ghost marker under the pointer: free-follows the finger while scrubbing,
  // otherwise sits on the previewed day (keyboard).
  const ghostAngle = previewIndex === null ? null : (previewAngle ?? dayAngleDeg(previewIndex, totalCells));

  function updatePreview(event: PointerEvent<HTMLDivElement>) {
    if (!dragRect.current) {
      dragRect.current = frameRef.current?.getBoundingClientRect() ?? null;
    }
    const rect = dragRect.current;
    if (rect) {
      const index = Math.min(dayIndexFromPoint(event.clientX, event.clientY, rect, totalCells), maxIndex);
      // The ghost free-follows the finger everywhere. On day 1 (against the top
      // seam) it's floored to the cell centre so it can't perch on the seam —
      // but only on the left side: past the centre it free-follows again, so the
      // day 1↔2 border stays scrubbable.
      const angle = pointerAngleDeg(event.clientX, event.clientY, rect);
      const day1Centre = dayAngleDeg(0, totalCells);
      setPreviewState({
        index,
        angle: index === 0 ? Math.max(angle, day1Centre) : angle,
      });
    }
  }

  function clearPreview() {
    dragRect.current = null;
    setPreviewState({ index: null, angle: null });
  }

  function releasePreview() {
    const from = ghostAngle;
    clearPreview();
    if (from !== null && currentIndex >= 0 && prefersMotion()) setSettle({ angle: from, moving: false });
  }

  useEffect(() => {
    if (settle && !settle.moving) {
      const frame = requestAnimationFrame(() => setSettle({ angle: rotation, moving: true }));
      return () => cancelAnimationFrame(frame);
    }
  }, [settle, rotation]);

  function stepPreview(step: number) {
    setPreviewState(({ index }) => {
      const from = typeof index === "number" ? index : Math.max(currentIndex, 0);
      return {
        index: Math.min(Math.max(from + step, 0), maxIndex),
        angle: null,
      };
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      stepPreview(1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      stepPreview(-1);
    } else if (event.key === "Escape") {
      clearPreview();
    }
  }

  const frameProps = {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRect.current = event.currentTarget.getBoundingClientRect();
      updatePreview(event);
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      // Only a pressed pointer scrubs; a stray mouse pass shouldn't
      // rewrite the screen's headline number.
      if (event.buttons > 0) {
        updatePreview(event);
      }
    },
    onPointerUp: releasePreview,
    onPointerLeave: releasePreview,
    onPointerCancel: clearPreview,
    onKeyDown: handleKeyDown,
    onBlur: clearPreview,
  };

  return {
    frameRef,
    frameProps,
    previewIndex,
    ghostAngle,
    settle,
    endSettle: () => setSettle(null),
  };
}
