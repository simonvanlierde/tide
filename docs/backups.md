# Save and restore a Tide backup

A JSON backup preserves your logged history and preferences. Save the downloaded file outside browser storage, somewhere only you can access.
The file contains sensitive health information in plain text. Tide does not encrypt it or send it to a server.

1. In **Settings → Data**, export a JSON backup. The filename is `tide-backup-YYYY-MM-DD.json`, using your local date.
2. Keep a copy outside the browser, such as a private folder on your device or removable storage.
3. Before restoring, export the current device's history too. Restoring has no undo.
4. Import the saved file. If any bleeding or diary history exists, confirm replacement; an empty history imports immediately.
5. Check known dates, diary-only entries and preferences after restoring. Keep both files until you have verified the result.

## Schema 4

[`backup-example.json`](backup-example.json) is a complete synthetic backup.
Run its export, parse and storage round trip with:

```sh
just ts-test tests/data/backup-contract.test.ts
```

The test uses the production download, restore parser and local-storage functions.
It checks every exported field, including diary-only days, incomplete-cycle markers and the calendar identity.

| Field | Meaning |
| --- | --- |
| `schemaVersion` | The format version, currently `4`. |
| `days` | Map from local calendar date to logged flow: `null`, `spotting`, `light`, `medium` or `heavy`. |
| `detailsByDay` | Independent diary entries keyed by local date, each with `symptoms`, `mood` and `note`. |
| `incompleteCycleStarts` | Starts of completed cycle intervals you marked incomplete. Those intervals do not contribute to prediction estimates. |
| `settings` | Preferences and calendar identity, listed below. |

Dates are exact `YYYY-MM-DD` calendar dates, without a time or timezone. Restore never shifts them between timezones.
A missing `days` key means no bleeding was logged on that date.
A `null` value means a period day was logged without choosing a flow level; it counts toward predictions.
`spotting` is a recorded flow level but does not start a predicted cycle.
Incomplete markers refer to cycle intervals, not arbitrary diary dates. Normalization removes markers whose interval no longer exists.

Diary entries do not require bleeding on the same date. Symptoms `null` means not logged; `[]` means explicitly **No symptoms**.
Mood is `null`, `low`, `okay` or `good`. Notes preserve their text, including line breaks, up to 1,000 UTF-16 code units.
The supported symptom identifiers and validation contract live in [`src/domain/diary.ts`](../src/domain/diary.ts).
An entry with no symptoms logged, no mood and an empty note contains no diary data and is omitted on normalization.

### Settings

Backups include `showFertility` (unanswered `null`, `true` or `false`), `showCycleDayNumbers`, `theme`, `language` and `calendarId`.
`system` follows the restoring device's theme or language. A valid `calendarId` preserves the identity of exported calendar events across devices.

Backups omit `dismissedOn`, `lastBackupOn` and `backupReminderDismissedOn`.
The restore UI keeps the destination device's backup dates; the other reminder dismissal resets.
Exporting records a backup date on the exporting device, outside the downloaded file.

### Validation and older backups

[`src/data/transfer.ts`](../src/data/transfer.ts) defines the backup writer and restore boundary.
[`src/data/schema.ts`](../src/data/schema.ts) defines normalization and migrations.
The UI rejects files larger than 5,000,000 bytes before reading them.
Invalid JSON, a missing logged-days field, a newer numeric schema version or malformed diary data fails before replacement.
The current data stays unchanged when parsing fails or you cancel confirmation.

Not every malformed value rejects the whole file: normalization drops invalid flow/date entries and defaults invalid settings.
Restore also removes future bleeding and diary dates. Review the restored result before deleting your original backup.
Unknown fields do not round-trip through this build.

Older backups can use `intensityByDay` instead of `days`, including the legacy `{ version, state }` envelope.
Unversioned data reads as schema 0. Before schema 2, an old `showFertility: true` default becomes unanswered;
`false` remains a deliberate choice. Missing newer fields use their current defaults.
Schema 3 added incomplete-cycle markers and local backup dates; schema 4 added independent diary entries.
Newer local-storage data opens read-only rather than being overwritten. A raw crash-recovery download preserves the stored blob without normalization.

## Other imports and calendar files

A Tide JSON restore replaces bleeding history, diary entries, incomplete markers and portable settings.
Supported Clue and Flo exports instead merge bleeding days only: existing Tide values win on overlapping dates.
They do not import diary entries or replace preferences. The confirmation shows the detected source and day count.
See [`src/data/otherApps.ts`](../src/data/otherApps.ts) for the supported foreign formats.

An ICS file shares calendar events; it is not a backup and cannot restore your Tide history.
Its private flag neither encrypts events nor guarantees that a calendar service hides them.
