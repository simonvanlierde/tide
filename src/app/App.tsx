import { startTransition, useEffect, useState, type MouseEvent } from "react";
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

interface UtilityNavProps {
  activePath: string;
  onNavigate: (nextPath: string) => void;
}

function UtilityNav({ activePath, onNavigate }: UtilityNavProps) {
  const activeScreen = getAppScreen(activePath);

  function handleClick(
    event: MouseEvent<HTMLAnchorElement>,
    nextPath: string,
  ) {
    if (!shouldHandleAppNavigation(event)) {
      return;
    }

    event.preventDefault();
    onNavigate(nextPath);
  }

  return (
    <header className="app-header">
      <div className="app-header__title">{activeScreen.title}</div>

      <nav aria-label="Primary navigation" className="utility-nav">
        {appScreens.map((screen) => (
          <a
            key={screen.path}
            href={screen.path}
            aria-current={screen.path === activePath ? "page" : undefined}
            className={
              screen.path === activePath ? "icon-button is-active" : "icon-button"
            }
            onClick={(event) => handleClick(event, screen.path)}
          >
            <span className="visually-hidden">{screen.navLabel}</span>
            <span aria-hidden="true">
              <AppIcon icon={screen.icon} />
            </span>
          </a>
        ))}
      </nav>
    </header>
  );
}

export function App() {
  const { pathname, navigate } = usePathname();
  const activeScreen = getAppScreen(pathname);

  return (
    <main className="app-shell">
      <UtilityNav activePath={activeScreen.path} onNavigate={navigate} />
      {activeScreen.render()}
    </main>
  );
}
