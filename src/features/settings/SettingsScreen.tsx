import { useState } from "react";
import { useAppState } from "../../hooks/useAppState";

export function SettingsScreen() {
  const { state, exportState, importState } = useAppState();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  function handleExport() {
    const backup = exportState();
    const blob = new Blob([backup], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "tide-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage("Backup exported");
  }

  return (
    <section className="utility-screen">
      <h1 className="utility-screen__title">Settings</h1>

      <article className="utility-card">
        <h2 className="section-title">Privacy</h2>
        <p>Your cycle data stays on this device unless you export it yourself.</p>
      </article>

      <article className="utility-card">
        <h2 className="section-title">Reminders</h2>
        <p>Reminder window: {state.settings.reminderWindowDays} days before the expected period.</p>
      </article>

      <article className="utility-card">
        <h2 className="section-title">Backup</h2>
        <button className="primary-action" onClick={handleExport}>
          Export backup
        </button>
        <label className="file-input">
          <span>Import backup file</span>
          <input
            type="file"
            aria-label="Import backup file"
            accept="application/json"
            onChange={async (event) => {
              const file = event.target.files?.[0];

              if (!file) {
                return;
              }

              await importState(file);
              setStatusMessage("Backup imported");
            }}
          />
        </label>
        {statusMessage ? <p className="supporting-note">{statusMessage}</p> : null}
      </article>
    </section>
  );
}
