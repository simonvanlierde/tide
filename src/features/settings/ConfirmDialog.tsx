import { type ReactNode, useEffect, useRef } from "react";
import { useT } from "../../state/provider";

interface ConfirmDialogProps {
  title: string;
  /** What the action will do, in the user's own terms. */
  body: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// A held breath before something irreversible. A native <dialog> gives the
// focus trap, Esc-to-close and backdrop for free; the browser's own confirm()
// gives none of the app's language, type or theme, and its buttons stay in the
// browser's locale rather than the one the user picked here.
export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmed = useRef(false);
  const t = useT();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Close through the dialog so the browser restores focus to the trigger
  // before we unmount (see CycleInsights for the same reasoning).
  const requestClose = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      // Both outcomes route through the native close, so the browser restores
      // focus to the trigger before either callback unmounts us.
      onClose={() => (confirmed.current ? onConfirm() : onCancel())}
    >
      <h2 id="confirm-dialog-title" className="confirm-dialog__title">
        {title}
      </h2>
      <div className="confirm-dialog__body">{body}</div>
      <div className="confirm-dialog__actions">
        <button
          type="button"
          className="secondary-action"
          onClick={requestClose}
        >
          {t("common.cancel")}
        </button>
        <button
          type="button"
          className="commit-action"
          onClick={() => {
            confirmed.current = true;
            requestClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
