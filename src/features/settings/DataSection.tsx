import { Download, Upload } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { downloadAppState, parseImportedState } from "../../data/transfer";
import { useAppState, useAppStateActions, useT } from "../../state/provider";
import { AppIcon } from "../../ui/icons";
import { InfoPopover } from "./InfoPopover";

export function DataSection() {
  const state = useAppState();
  const actions = useAppStateActions();
  const t = useT();
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
      setError(t("settings.importError"));
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
            onClick={() => fileInput.current?.click()}
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
