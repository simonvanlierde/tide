import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { routes } from "./routes";
import { AppIcon } from "../ui/icons";
import { AppStateProvider } from "../state/appState";

function UtilityNav() {
  const location = useLocation();
  const activeRoute =
    routes.find((route) => route.path === location.pathname) ?? routes[0];

  return (
    <header className="app-header">
      <div className="app-header__title">{activeRoute.title}</div>

      <nav aria-label="Primary navigation" className="utility-nav">
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            aria-label={route.navLabel}
            className={({ isActive }) =>
              isActive ? "icon-button is-active" : "icon-button"
            }
          >
            <span aria-hidden="true">
              <AppIcon icon={route.icon} />
            </span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export function App() {
  return (
    <AppStateProvider>
      <main className="app-shell">
        <UtilityNav />
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>
    </AppStateProvider>
  );
}
