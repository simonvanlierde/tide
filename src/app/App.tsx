import { CircleAlert } from "lucide-react";
import { lazy, type MouseEvent, Suspense, startTransition, useEffect, useRef, useState } from "react";
import { useIsReadOnly, useLocale, useStorageError, useT } from "../state/provider";
import { useToday } from "../state/useToday";
import { AppIcon } from "../ui/icons";
import { formatShortDate } from "../utils/date";
import { legalPage } from "./LegalPages";
import { shouldHandleAppNavigation } from "./links";
import { appScreens, getAppScreen } from "./navigation";

function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    function handlePopState() {
      setPathname(window.location.pathname);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(nextPath: string) {
    if (nextPath === window.location.pathname) {
      return;
    }

    window.history.pushState(null, "", nextPath);
    startTransition(() => {
      setPathname(nextPath);
    });
  }

  return { pathname, navigate };
}

interface TabBarProps {
  pathname: string;
  activePath: string;
  onNavigate: (nextPath: string) => void;
}

function TabBar({ pathname, activePath, onNavigate }: TabBarProps) {
  const t = useT();

  function handleClick(event: MouseEvent<HTMLAnchorElement>, nextPath: string) {
    if (!shouldHandleAppNavigation(event)) {
      return;
    }

    event.preventDefault();
    onNavigate(nextPath);
  }

  return (
    <nav aria-label={t("app.primaryNav")} className="tab-bar">
      {appScreens.map((screen) => (
        <a
          key={screen.path}
          href={screen.path}
          // A legal page sits under Settings: the tab is current, but not the page.
          aria-current={screen.path === pathname ? "page" : screen.path === activePath ? "true" : undefined}
          className={screen.path === activePath ? "tab-item is-active" : "tab-item"}
          onClick={(event) => handleClick(event, screen.path)}
        >
          <span aria-hidden="true">
            <AppIcon icon={screen.icon} className="tab-item__glyph" />
          </span>
          <span className="tab-item__label">{t(screen.labelKey)}</span>
        </a>
      ))}
    </nav>
  );
}

const LegalPage = lazy(() => import("./LegalPage"));

export function App() {
  const { pathname, navigate } = usePathname();
  const legal = legalPage(pathname);
  // The legal pages open from Settings > About, so Settings stays the active tab.
  const activeScreen = getAppScreen(legal ? "/settings" : pathname);
  const t = useT();
  const locale = useLocale();
  const today = useToday();
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);
  const readOnly = useIsReadOnly();
  const storageError = useStorageError();

  // Move focus to the new screen's content so assistive tech announces the
  // change instead of staying on the now-stale tab, or to the element a
  // #fragment names (Today's import link). Skipped on initial load.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on every pathname change is the point.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const target = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
    if (target) {
      target.focus();
    } else {
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [pathname]);

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        {t("app.skipToContent")}
      </a>
      <header className="app-header">
        <span className="app-wordmark">tide</span>
        <span className="app-header__title">
          {t(legal ? legal.labelKey : activeScreen.labelKey)}
          {/* Today's estimates are dates, so the screen names the day they count from. */}
          {!legal && activeScreen.path === "/" ? (
            <>
              {" · "}
              <time dateTime={today}>{formatShortDate(today, locale)}</time>
            </>
          ) : null}
        </span>
      </header>
      <main id="main" ref={mainRef} className="app-main" tabIndex={-1}>
        {/* Mounted empty from the start: screen readers announce text added to
            a live region, but often not a region that arrives already filled. */}
        <div role="status">
          {readOnly ? (
            <div className="utility-card utility-card--slim newer-data-notice">
              <p id="newer-data-notice" className="supporting-note supporting-note--icon">
                <AppIcon icon={CircleAlert} className="supporting-note__icon" />
                <span>{t("app.newerData")}</span>
              </p>
              <button type="button" className="text-action" onClick={() => window.location.reload()}>
                {t("common.reload")}
              </button>
            </div>
          ) : null}
        </div>
        {storageError && !readOnly ? (
          <div className="utility-card utility-card--slim" role="alert">
            <p className="supporting-note supporting-note--icon supporting-note--error">
              <AppIcon icon={CircleAlert} className="supporting-note__icon" />
              <span>{t("app.storageError")}</span>
            </p>
          </div>
        ) : null}
        {legal ? (
          <Suspense fallback={null}>
            <LegalPage page={legal} />
          </Suspense>
        ) : (
          activeScreen.render()
        )}
      </main>
      <TabBar pathname={pathname} activePath={activeScreen.path} onNavigate={navigate} />
    </div>
  );
}
