import { Component, type ReactNode } from "react";
import { normalizeSettings } from "../data/schema";
import { loadRawAppState } from "../data/storage";
import { downloadRawState } from "../data/transfer";
import { resolveLanguage, type SupportedLanguage, translate } from "../i18n";

interface ErrorBoundaryState {
  hasError: boolean;
}

// The stored language preference when the blob still parses, else the
// browser's. The provider may be what crashed, so this reads storage directly.
function crashLanguage(raw: string | null): SupportedLanguage {
  try {
    const parsed: { settings?: unknown } = JSON.parse(raw ?? "");
    return resolveLanguage(normalizeSettings(parsed?.settings).language);
  } catch {
    return resolveLanguage("system");
  }
}

// Last-resort fallback: a render crash otherwise leaves a blank page with no
// way to reach the data export. It sits above the state provider (which can
// itself throw), so it reads storage on its own. Reloading re-reads storage,
// which the reducer effect never clears, so no logged day is lost.
export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    const raw = loadRawAppState();
    const lang = crashLanguage(raw);
    return (
      <main className="app-main" role="alert" lang={lang}>
        <article className="utility-card">
          <h1 className="section-title">{translate(lang, "error.title")}</h1>
          <p className="supporting-note">{translate(lang, "error.body")}</p>
          <button
            type="button"
            className="chip-button"
            onClick={() => window.location.reload()}
          >
            {translate(lang, "common.reload")}
          </button>
          {raw ? (
            <button
              type="button"
              className="chip-button"
              onClick={() => downloadRawState(raw)}
            >
              {translate(lang, "error.downloadRaw")}
            </button>
          ) : null}
        </article>
      </main>
    );
  }
}
