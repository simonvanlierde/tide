import { CircleAlert, Download, Trash2, Upload } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { downloadAppState, parseImportedState } from "../../data/transfer";
import { plural } from "../../i18n";
import { useAppState, useAppStateActions, useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { InfoPopover } from "./InfoPopover";

const MAX_IMPORT_BYTES = 5_000_000;

export function DataSection() {
  const state = useAppState();
  const actions = useAppStateActions();
  const t = useT();
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  // Number of logged days the last successful import brought in; the only
  // feedback the user gets that anything happened.
  const [imported, setImported] = useState<number | null>(null);
  const hasLoggedDays = Object.keys(state.intensityByDay).length > 0;

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    event.target.value = "";
    if (!file) {
      return;
    }

    // A real backup is a few KB; anything huge is the wrong file, and reading
    // it whole would hang the tab.
    if (file.size > MAX_IMPORT_BYTES) {
      setImported(null);
      setError(t("settings.importError"));
      return;
    }

    try {
      const next = parseImportedState(await file.text());
      // Import replaces everything and there is no undo, so confirm before
      // overwriting an existing log.
      // biome-ignore lint/suspicious/noAlert: native confirm is the right weight for a rare destructive action; no custom dialog to maintain.
      if (hasLoggedDays && !window.confirm(t("settings.importConfirm"))) {
        return;
      }
      actions.importState(next);
      setError(null);
      setImported(Object.keys(next.intensityByDay).length);
    } catch {
      setImported(null);
      setError(t("settings.importError"));
    }
  }

  function handleReset() {
    // biome-ignore lint/suspicious/noAlert: see above.
    if (window.confirm(t("settings.resetConfirm"))) {
      actions.resetState();
      setError(null);
      setImported(null);
    }
  }

  return (
    <article className="utility-card utility-card--slim">
      <div className="section-heading-row">
        <h2 className="section-title">{t("settings.data")}</h2>
        <InfoPopover label={t("settings.dataInfo")}>
          {t("settings.dataHelp")}
        </InfoPopover>
      </div>
      <div className="settings-group settings-group--compact">
        <div className="chip-row chip-row--dense">
          <button
            type="button"
            className="chip-button"
            aria-label={t("settings.export")}
            onClick={() => downloadAppState(state)}
          >
            <AppIcon icon={Download} className="chip-button__icon" />
            <span className="chip-button__label">{t("settings.export")}</span>
          </button>
          <button
            type="button"
            className="chip-button"
            aria-label={t("settings.import")}
            onClick={() => {
              // A stale error from the last attempt shouldn't outlive a new pick.
              setError(null);
              fileInput.current?.click();
            }}
          >
            <AppIcon icon={Upload} className="chip-button__icon" />
            <span className="chip-button__label">{t("settings.import")}</span>
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          aria-label={t("settings.importFile")}
          className="visually-hidden"
          // The Import chip opens it; a second, invisible tab stop only confuses.
          tabIndex={-1}
          onChange={handleImport}
        />
        {error ? (
          <p className="supporting-note supporting-note--error" role="alert">
            <AppIcon icon={CircleAlert} className="supporting-note__icon" />
            <span>{error}</span>
          </p>
        ) : null}
        {imported !== null ? (
          <p className="status-row" role="status">
            <span className="status-chip">
              {t(plural("settings.importSuccess", imported), { n: imported })}
            </span>
          </p>
        ) : null}
        <button type="button" className="text-action" onClick={handleReset}>
          <AppIcon icon={Trash2} className="text-action__icon" />
          {t("settings.reset")}
        </button>
      </div>
    </article>
  );
}
