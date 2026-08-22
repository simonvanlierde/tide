import { Component, type ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
}

// Last-resort fallback: a render crash otherwise leaves a blank page with no
// way to reach the data export. It sits above the state provider (which can
// itself throw), so the copy is untranslated. Reloading re-reads storage,
// which the reducer effect never clears, so no logged day is lost.
export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <main className="app-main" role="alert" lang="en">
        <article className="utility-card">
          <h1 className="section-title">Something went wrong</h1>
          <p className="supporting-note">
            Your logged days are still saved on this device.
          </p>
          <button
            type="button"
            className="chip-button"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </article>
      </main>
    );
  }
}
