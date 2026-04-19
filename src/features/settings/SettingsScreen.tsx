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
    <section>
      <h1>Settings</h1>
      <p>Your cycle data stays on this device unless you export it yourself.</p>
      <p>Reminder window: {state.settings.reminderWindowDays} days before the expected period.</p>
      <button onClick={handleExport}>Export backup</button>
      <label>
        Import backup file
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
      {statusMessage ? <p>{statusMessage}</p> : null}
    </section>
  );
}
