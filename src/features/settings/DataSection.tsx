import {
  CircleAlert,
  Download,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import type { OtherAppImport } from "../../data/otherApps";
import {
  downloadAppState,
  mergeImportedDays,
  parseImportedState,
} from "../../data/transfer";
import type { AppState, IsoDate } from "../../domain/types";
import { plural } from "../../i18n";
import {
  useAppState,
  useAppStateActions,
  useIsReadOnly,
  useT,
} from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { ConfirmDialog } from "./ConfirmDialog";
import { InfoPopover } from "./InfoPopover";

const MAX_IMPORT_BYTES = 5_000_000;

/** What the last export or import did, so neither happens in silence. */
type DataStatus = { kind: "imported"; days: number } | { kind: "exported" };

interface DataSectionProps {
  /** Another app's days after this one are dropped on import. */
  today: IsoDate;
}

export function DataSection({ today }: DataSectionProps) {
  const state = useAppState();
  const actions = useAppStateActions();
  const t = useT();
  // A newer build saved the data and this tab never saves, so an import would
  // vanish on reload and a delete would wipe data this build can't read.
  const readOnly = useIsReadOnly();
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<DataStatus | null>(null);
  // A parsed import waiting for the user to agree. A Tide backup replaces
  // what's here. Another app's days merge into the state at confirm time, so
  // a save from another tab while the dialog is open is kept.
  const [pendingImport, setPendingImport] = useState<
    ({ fileDays: number } & ({ next: AppState } | OtherAppImport)) | null
  >(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const loggedDayCount = Object.keys(state.intensityByDay).length;

  // The status counts the days the import added: all of a backup, or only the
  // new days of a merge.
  function applyImport(next: AppState, merged = false) {
    actions.importState(next);
    setError(null);
    setStatus({
      kind: "imported",
      days:
        Object.keys(next.intensityByDay).length - (merged ? loggedDayCount : 0),
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

    let text: string;
    try {
      text = await file.text();
    } catch {
      setStatus(null);
      setError(t("settings.importError"));
      return;
    }
    let next: AppState;
    try {
      next = parseImportedState(text, today);
    } catch {
      // Not a Tide backup: try the other apps' formats, loaded only now.
      const { parseOtherAppExport } = await import("../../data/otherApps");
      const other = parseOtherAppExport(text, today);
      if (!other) {
        setStatus(null);
        setError(t("settings.importError"));
        return;
      }
      // Always confirm: the file's format is a guess, so the user checks the
      // day count before anything is written.
      setPendingImport({ ...other, fileDays: Object.keys(other.days).length });
      return;
    }
    // Import replaces everything and there is no undo, so ask first, but
    // only when there is something to lose.
    if (loggedDayCount > 0) {
      setPendingImport({
        next,
        fileDays: Object.keys(next.intensityByDay).length,
      });
      return;
    }
    applyImport(next);
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
            id="import"
            type="button"
            className="secondary-action"
            disabled={readOnly}
            aria-describedby={readOnly ? "newer-data-notice" : "import-sources"}
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
        {/* Someone arriving from Clue or Flo should see that Import is their
            way in without opening the info popover. */}
        <p id="import-sources" className="supporting-note">
          {t("settings.importSources")}
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json,.cluedata"
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
          disabled={readOnly}
          aria-describedby={readOnly ? "newer-data-notice" : undefined}
          onClick={() => setConfirmingReset(true)}
        >
          <AppIcon icon={Trash2} className="text-action__icon" />
          {t("settings.reset")}
        </button>
      </div>

      {pendingImport ? (
        <ConfirmDialog
          title={
            "source" in pendingImport
              ? t("settings.importMergeTitle", { source: pendingImport.source })
              : t("settings.importConfirmTitle")
          }
          body={
            <>
              <p>
                {t(plural("settings.importFileDays", pendingImport.fileDays), {
                  n: pendingImport.fileDays,
                })}
              </p>
              <p>
                {"source" in pendingImport
                  ? t("settings.importMerges")
                  : t(plural("settings.importReplaces", loggedDayCount), {
                      n: loggedDayCount,
                    })}
              </p>
            </>
          }
          confirmLabel={t(
            "source" in pendingImport
              ? "settings.importMergeAction"
              : "settings.importConfirmAction",
          )}
          onConfirm={() => {
            const merged = "source" in pendingImport;
            applyImport(
              merged
                ? mergeImportedDays(state, pendingImport.days)
                : pendingImport.next,
              merged,
            );
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
