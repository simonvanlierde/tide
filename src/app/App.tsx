import {
  type MouseEvent,
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";
import { useT } from "../state/provider";
import { AppIcon } from "../ui/icons";
import {
  appScreens,
  getAppScreen,
  shouldHandleAppNavigation,
} from "./navigation";

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
  activePath: string;
  onNavigate: (nextPath: string) => void;
}

function TabBar({ activePath, onNavigate }: TabBarProps) {
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
          aria-current={screen.path === activePath ? "page" : undefined}
          className={
            screen.path === activePath ? "tab-item is-active" : "tab-item"
          }
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

export function App() {
  const { pathname, navigate } = usePathname();
  const activeScreen = getAppScreen(pathname);
  const t = useT();
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  // Move focus to the new screen's content so assistive tech announces the
  // change instead of staying on the now-stale tab. Skipped on initial load.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on every pathname change is the point.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        {t("app.skipToContent")}
      </a>
      <header className="app-header">
        <span className="app-wordmark">tide</span>
        <span className="app-header__title">{t(activeScreen.labelKey)}</span>
      </header>
      <main id="main" ref={mainRef} className="app-main" tabIndex={-1}>
        {activeScreen.render()}
      </main>
      <TabBar activePath={activeScreen.path} onNavigate={navigate} />
    </div>
  );
}
