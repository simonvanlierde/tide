import {
  CircleAlert,
  Download,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { downloadAppState, parseImportedState } from "../../data/transfer";
import type { AppState } from "../../domain/types";
import { plural } from "../../i18n";
import { useAppState, useAppStateActions, useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { ConfirmDialog } from "./ConfirmDialog";
import { InfoPopover } from "./InfoPopover";

const MAX_IMPORT_BYTES = 5_000_000;

/** What the last export or import did, so neither happens in silence. */
type DataStatus = { kind: "imported"; days: number } | { kind: "exported" };

export function DataSection() {
  const state = useAppState();
  const actions = useAppStateActions();
  const t = useT();
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<DataStatus | null>(null);
  // A parsed backup waiting for the user to agree to overwrite what's here.
  const [pendingImport, setPendingImport] = useState<AppState | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const loggedDayCount = Object.keys(state.intensityByDay).length;

  function applyImport(next: AppState) {
    actions.importState(next);
    setError(null);
    setStatus({
      kind: "imported",
      days: Object.keys(next.intensityByDay).length,
    });
  }

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
      setStatus(null);
      setError(t("settings.importError"));
      return;
    }

    try {
      const next = parseImportedState(await file.text());
      // Import replaces everything and there is no undo, so ask first — but
      // only when there is something to lose.
      if (loggedDayCount > 0) {
        setPendingImport(next);
        return;
      }
      applyImport(next);
    } catch {
      setStatus(null);
      setError(t("settings.importError"));
    }
  }

  function handleExport() {
    downloadAppState(state);
    setError(null);
    setStatus({ kind: "exported" });
  }

  return (
    <article className="utility-card utility-card--slim">
      <header className="section-heading">
        <div className="section-heading-row">
          <h2 className="section-title">{t("settings.data")}</h2>
          <InfoPopover label={t("settings.dataInfo")} align="start">
            {t("settings.dataHelp")}
          </InfoPopover>
        </div>
        {/* Answers "where does my data go?" before the controls that move it.
            Prose, not a pill: a sentence the width of the card shaped like a
            control reads as a button that doesn't answer. */}
        <p className="supporting-note supporting-note--icon">
          <AppIcon
            icon={ShieldCheck}
            className="supporting-note__icon supporting-note__icon--assuring"
          />
          <span>{t("settings.privacy")}</span>
        </p>
      </header>
      <div className="settings-group settings-group--compact">
        <div className="data-actions">
          <button
            type="button"
            className="secondary-action"
            onClick={handleExport}
          >
            <span className="button-label">
              <AppIcon icon={Download} className="button-icon" />
              <span>{t("settings.export")}</span>
            </span>
          </button>
          <button
            type="button"
            className="secondary-action"
            onClick={() => {
              // A stale message from the last attempt shouldn't outlive a new pick.
              setError(null);
              setStatus(null);
              fileInput.current?.click();
            }}
          >
            <span className="button-label">
              <AppIcon icon={Upload} className="button-icon" />
              <span>{t("settings.import")}</span>
            </span>
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
          <p
            className="supporting-note supporting-note--icon supporting-note--error"
            role="alert"
          >
            <AppIcon icon={CircleAlert} className="supporting-note__icon" />
            <span>{error}</span>
          </p>
        ) : null}
        {status ? (
          <p className="status-row" role="status">
            <span className="status-chip">
              {status.kind === "exported"
                ? t("settings.exportSuccess")
                : t(plural("settings.importSuccess", status.days), {
                    n: status.days,
                  })}
            </span>
          </p>
        ) : null}
        <button
          type="button"
          className="text-action"
          onClick={() => setConfirmingReset(true)}
        >
          <AppIcon icon={Trash2} className="text-action__icon" />
          {t("settings.reset")}
        </button>
      </div>

      {pendingImport ? (
        <ConfirmDialog
          title={t("settings.importConfirmTitle")}
          body={
            <>
              <p>
                {t(
                  plural(
                    "settings.importFileDays",
                    Object.keys(pendingImport.intensityByDay).length,
                  ),
                  { n: Object.keys(pendingImport.intensityByDay).length },
                )}
              </p>
              <p>
                {t(plural("settings.importReplaces", loggedDayCount), {
                  n: loggedDayCount,
                })}
              </p>
            </>
          }
          confirmLabel={t("settings.importConfirmAction")}
          onConfirm={() => {
            applyImport(pendingImport);
            setPendingImport(null);
          }}
          onCancel={() => setPendingImport(null)}
        />
      ) : null}

      {confirmingReset ? (
        <ConfirmDialog
          title={t("settings.resetTitle")}
          body={<p>{t("settings.resetConfirm")}</p>}
          confirmLabel={t("settings.resetAction")}
          onConfirm={() => {
            actions.resetState();
            setError(null);
            setStatus(null);
            setConfirmingReset(false);
          }}
          onCancel={() => setConfirmingReset(false)}
        />
      ) : null}
    </article>
  );
}
