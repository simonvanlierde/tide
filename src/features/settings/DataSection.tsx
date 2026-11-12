import { CalendarPlus, CircleAlert, Download, ShieldCheck, Trash2, Upload } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import type { OtherAppImport } from "../../data/otherApps";
import { downloadAppState, mergeImportedDays, parseImportedState } from "../../data/transfer";
import { getExpectedCycles } from "../../domain/cycle";
import type { AppState, IsoDate } from "../../domain/types";
import { useAppState, useAppStateActions, useForecast, useIsReadOnly, useLocale, useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { formatShortDate } from "../../utils/date";
import { ConfirmDialog } from "./ConfirmDialog";

const MAX_IMPORT_BYTES = 5_000_000;

/** What the last export, import or delete did, so none happens in silence. */
type DataStatus = { kind: "imported"; days: number } | { kind: "exported" } | { kind: "calendar" } | { kind: "reset" };

/** The Data card's jobs; feedback shows under the one that caused it. */
type DataGroup = "history" | "calendar";

const CALENDAR_CYCLES = 3;

interface DataSectionProps {
  /** Another app's days after this one are dropped on import. */
  today: IsoDate;
}

export function DataSection({ today }: DataSectionProps) {
  const state = useAppState();
  const actions = useAppStateActions();
  const t = useT();
  const locale = useLocale();
  // A newer build saved the data and this tab never saves, so an import would
  // vanish on reload and a delete would wipe data this build can't read.
  const readOnly = useIsReadOnly();
  // Another tab can save while a file or its import reader is loading.
  const latest = useRef({ state, readOnly });
  latest.current = { state, readOnly };
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<{ group: DataGroup; text: string } | null>(null);
  const [status, setStatus] = useState<DataStatus | null>(null);
  // A parsed import waiting for the user to agree. A Tide backup replaces
  // what's here. Another app's days merge into the state at confirm time, so
  // a save from another tab while the dialog is open is kept.
  const [pendingImport, setPendingImport] = useState<
    ({ fileDays: number } & ({ next: AppState } | OtherAppImport)) | null
  >(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [calendarFertile, setCalendarFertile] = useState(false);
  const showFertility = state.settings.showFertility === true;
  const expectedCycles = getExpectedCycles(useForecast(today), today, CALENDAR_CYCLES);
  const loggedDayCount = Object.keys(state.intensityByDay).length;

  function fail(group: DataGroup, text: string) {
    setStatus(null);
    setError({ group, text });
  }

  useEffect(() => {
    if (readOnly) {
      setPendingImport(null);
      setConfirmingReset(false);
    }
  }, [readOnly]);

  // The status counts the days the import added: all of a backup, or only the
  // new days of a merge. The backup dates describe this device, not the file,
  // so an import keeps them and Calendar guidance. A successful import
  // completes the first-run introduction.
  function applyImport(next: AppState, merged = false) {
    if (latest.current.readOnly) return;
    const current = latest.current.state;
    const { lastBackupOn, backupReminderDismissedOn, calendarHelpDismissed } = current.settings;
    actions.importState({
      ...next,
      settings: {
        ...next.settings,
        lastBackupOn,
        backupReminderDismissedOn,
        calendarHelpDismissed,
        onboardingDismissed: true,
      },
    });
    setError(null);
    setStatus({
      kind: "imported",
      days: Object.keys(next.intensityByDay).length - (merged ? Object.keys(current.intensityByDay).length : 0),
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
      fail("history", t("settings.importError"));
      return;
    }

    let text: string;
    try {
      text = await file.text();
    } catch {
      fail("history", t("settings.importError"));
      return;
    }
    if (latest.current.readOnly) return;
    let next: AppState;
    try {
      next = parseImportedState(text, today);
    } catch {
      // Not a Tide backup: try the other apps' formats, loaded only now.
      let parseOtherAppExport: typeof import("../../data/otherApps").parseOtherAppExport;
      try {
        ({ parseOtherAppExport } = await import("../../data/otherApps"));
      } catch {
        fail("history", t("settings.importUnavailable"));
        return;
      }
      if (latest.current.readOnly) return;
      const other = parseOtherAppExport(text, today);
      if (!other) {
        fail("history", t("settings.importError"));
        return;
      }
      // Always confirm: the file's format is a guess, so the user checks the
      // day count before anything is written.
      setPendingImport({ ...other, fileDays: Object.keys(other.days).length });
      return;
    }
    // Import replaces everything and there is no undo, so ask first, but
    // only when there is something to lose.
    const current = latest.current.state;
    if (Object.keys(current.intensityByDay).length > 0 || Object.keys(current.detailsByDay).length > 0) {
      setPendingImport({
        next,
        fileDays: Object.keys(next.intensityByDay).length,
      });
      return;
    }
    applyImport(next);
  }

  function handleExport() {
    try {
      downloadAppState(state);
      if (!readOnly) {
        actions.setSetting("lastBackupOn", today);
        actions.setSetting("backupReminderDismissedOn", null);
      }
      setError(null);
      setStatus({ kind: "exported" });
    } catch {
      fail("history", t("backup.error"));
    }
  }

  async function handleCalendarExport() {
    const calendarId = state.settings.calendarId ?? crypto.randomUUID();
    if (state.settings.calendarId === null) {
      actions.setSetting("calendarId", calendarId);
    }
    try {
      // Loaded on first use, like the other apps' import formats.
      const { downloadCalendar } = await import("../../data/calendarFile");
      downloadCalendar(expectedCycles, {
        today,
        fertility: showFertility && calendarFertile,
        words: {
          period: t("legend.expected"),
          fertile: t("legend.fertileWindow"),
          disclaimer: t("settings.fertilityDisclaimer"),
        },
        now: new Date(),
        calendarId,
      });
    } catch {
      fail("calendar", t("settings.calendarError"));
      return;
    }
    setError(null);
    setStatus({ kind: "calendar" });
  }

  function feedback(group: DataGroup) {
    const statusGroup: DataGroup | null = status ? (status.kind === "calendar" ? "calendar" : "history") : null;
    return (
      <>
        {error?.group === group ? (
          <p className="supporting-note supporting-note--icon supporting-note--error" role="alert">
            <AppIcon icon={CircleAlert} className="supporting-note__icon" />
            <span>{error.text}</span>
          </p>
        ) : null}
        {status && statusGroup === group ? (
          <p className="status-row" role="status">
            <span className="status-chip">{statusText(status)}</span>
          </p>
        ) : null}
      </>
    );
  }

  function statusText(done: DataStatus) {
    switch (done.kind) {
      case "imported":
        return t("settings.importSuccess", { n: done.days });
      case "exported":
        return t("settings.exportSuccess");
      case "calendar":
        return t("settings.calendarSuccess");
      case "reset":
        return t("settings.resetSuccess");
    }
  }

  // Offered inside the dialogs that cannot be undone, so the safe path is
  // one tap away rather than a cancel and a scroll.
  const backupFirst =
    status?.kind === "exported" ? (
      <p className="status-row" role="status">
        <span className="status-chip">{t("settings.exportSuccess")}</span>
      </p>
    ) : (
      <button type="button" className="secondary-action" onClick={handleExport}>
        <span className="button-label">
          <AppIcon icon={Download} className="button-icon" />
          <span>{t("settings.backupFirst")}</span>
        </span>
      </button>
    );

  const { lastBackupOn } = state.settings;

  return (
    <article className="utility-card utility-card--slim">
      <header className="section-heading">
        <h2 className="section-title">{t("settings.data")}</h2>
        {/* Answers "where does my data go?" before the controls that move it.
            Prose, not a pill: a sentence the width of the card shaped like a
            control reads as a button that doesn't answer. */}
        <p className="supporting-note supporting-note--icon">
          <AppIcon icon={ShieldCheck} className="supporting-note__icon supporting-note__icon--assuring" />
          <span>
            {t("settings.privacy")}
            {/* What is on this device and when it was last saved off it, so
                the promise above has something to show for itself. */}
            {loggedDayCount > 0 ? (
              <span className="data-summary">
                {t("settings.dataSummary", { n: loggedDayCount })}
                {" · "}
                {lastBackupOn
                  ? // Non-breaking spaces keep the date on one line; the rest may wrap.
                    t("settings.lastBackup", { date: formatShortDate(lastBackupOn, locale).replaceAll(" ", "\u00a0") })
                  : t("settings.noBackup")}
              </span>
            ) : null}
          </span>
        </p>
      </header>
      <div className="settings-group settings-group--compact">
        <div className="data-group">
          <div className="data-actions">
            <button type="button" className="secondary-action" onClick={handleExport}>
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
              way in without opening a popover. */}
          <p id="import-sources" className="supporting-note">
            {t("settings.importSources")}
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json,.cluedata"
            aria-label={t("settings.importFile")}
            className="visually-hidden"
            // The Import button opens it; a second, invisible tab stop only confuses.
            tabIndex={-1}
            onChange={handleImport}
          />
          {feedback("history")}
        </div>
        {/* Nothing to put in a calendar until there is a forecast. */}
        {expectedCycles.length > 0 ? (
          <div className="data-group">
            <button
              type="button"
              className="secondary-action"
              aria-describedby="calendar-help"
              onClick={handleCalendarExport}
            >
              <span className="button-label">
                <AppIcon icon={CalendarPlus} className="button-icon" />
                <span>{t("settings.exportCalendar")}</span>
              </span>
            </button>
            <p id="calendar-help" className="supporting-note">
              {t("settings.calendarHelp", { n: CALENDAR_CYCLES })}
            </p>
            {showFertility ? (
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={calendarFertile}
                  onChange={(event) => setCalendarFertile(event.target.checked)}
                />
                <span>{t("settings.calendarFertility")}</span>
              </label>
            ) : null}
            {feedback("calendar")}
          </div>
        ) : null}
        <div className="data-group data-group--danger">
          <button
            type="button"
            className="text-action text-action--danger"
            disabled={readOnly}
            aria-describedby={readOnly ? "newer-data-notice" : undefined}
            onClick={() => setConfirmingReset(true)}
          >
            <AppIcon icon={Trash2} className="text-action__icon" />
            {t("settings.reset")}
          </button>
        </div>
      </div>

      {pendingImport && !readOnly ? (
        <ConfirmDialog
          title={
            "source" in pendingImport
              ? t("settings.importMergeTitle", { source: pendingImport.source })
              : t("settings.importConfirmTitle")
          }
          body={
            <>
              <p>
                {t("settings.importFileDays", {
                  n: pendingImport.fileDays,
                })}
              </p>
              {"next" in pendingImport ? <p>{t("settings.importReplacesDetails")}</p> : null}
              <p>
                {"source" in pendingImport
                  ? t("settings.importMerges")
                  : t("settings.importReplaces", {
                      n: loggedDayCount,
                    })}
              </p>
              {"next" in pendingImport ? backupFirst : null}
            </>
          }
          confirmLabel={t("source" in pendingImport ? "settings.importMergeAction" : "settings.importConfirmAction")}
          destructive={"next" in pendingImport}
          onConfirm={() => {
            const merged = "source" in pendingImport;
            applyImport(merged ? mergeImportedDays(state, pendingImport.days) : pendingImport.next, merged);
            setPendingImport(null);
          }}
          onCancel={() => setPendingImport(null)}
        />
      ) : null}

      {confirmingReset && !readOnly ? (
        <ConfirmDialog
          title={t("settings.resetTitle")}
          body={
            <>
              <p>{t("settings.resetConfirm")}</p>
              {loggedDayCount > 0 ? backupFirst : null}
            </>
          }
          confirmLabel={t("settings.resetAction")}
          destructive
          onConfirm={() => {
            actions.resetState();
            setError(null);
            setStatus({ kind: "reset" });
            setConfirmingReset(false);
          }}
          onCancel={() => setConfirmingReset(false)}
        />
      ) : null}
    </article>
  );
}
