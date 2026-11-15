import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { ErrorBoundary, storedLanguage } from "./app/ErrorBoundary";
import { loadRawAppState } from "./data/storage";
import { loadCatalog } from "./i18n";
import { AppStateProvider } from "./state/provider";
import "./styles/global.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container not found");
}

// Wait for the saved language's catalog, so the first frame is already translated.
// A failed load still renders: the provider waits for the catalog itself.
// No top-level await: it would split the shared modules out of the entry chunk.
loadCatalog(storedLanguage(loadRawAppState()))
  .catch(() => undefined)
  .then(() =>
    createRoot(container).render(
      <StrictMode>
        <ErrorBoundary>
          <AppStateProvider>
            <App />
          </AppStateProvider>
        </ErrorBoundary>
      </StrictMode>,
    ),
  );
