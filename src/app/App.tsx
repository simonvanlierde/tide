import { type MouseEvent, startTransition, useEffect, useState } from "react";
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
  function handleClick(event: MouseEvent<HTMLAnchorElement>, nextPath: string) {
    if (!shouldHandleAppNavigation(event)) {
      return;
    }

    event.preventDefault();
    onNavigate(nextPath);
  }

  return (
    <nav aria-label="Primary navigation" className="tab-bar">
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
          <span className="tab-item__label">{screen.navLabel}</span>
        </a>
      ))}
    </nav>
  );
}

export function App() {
  const { pathname, navigate } = usePathname();
  const activeScreen = getAppScreen(pathname);

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="app-header">
        <span className="app-wordmark">tide</span>
        <span className="app-header__title">{activeScreen.title}</span>
      </header>
      <main id="main" className="app-main" tabIndex={-1}>
        {activeScreen.render()}
      </main>
      <TabBar activePath={activeScreen.path} onNavigate={navigate} />
    </div>
  );
}
