import { Download, Upload } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { downloadAppState, parseImportedState } from "../../data/transfer";
import { useAppState, useAppStateActions } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { SETTINGS_HELP } from "./config";
import { InfoPopover } from "./InfoPopover";

export function DataSection() {
  const state = useAppState();
  const actions = useAppStateActions();
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    event.target.value = "";
    if (!file) {
      return;
    }

    try {
      actions.importState(parseImportedState(await file.text()));
      setError(null);
    } catch {
      setError("That file isn't a valid Tide backup.");
    }
  }

  return (
    <article className="utility-card">
      <div className="section-heading-row">
        <h2 className="section-title">Data</h2>
        <InfoPopover label="About import and export">
          {SETTINGS_HELP.data}
        </InfoPopover>
      </div>
      <div className="settings-group settings-group--compact">
        <div className="chip-row chip-row--dense">
          <button
            type="button"
            className="chip-button"
            aria-label="Export"
            onClick={() => downloadAppState(state)}
          >
            <AppIcon icon={Download} className="chip-button__icon" />
            <span className="chip-button__label">Export</span>
          </button>
          <button
            type="button"
            className="chip-button"
            aria-label="Import"
            onClick={() => fileInput.current?.click()}
          >
            <AppIcon icon={Upload} className="chip-button__icon" />
            <span className="chip-button__label">Import</span>
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="visually-hidden"
          onChange={handleImport}
        />
        {error ? (
          <p className="supporting-note" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </article>
  );
}
