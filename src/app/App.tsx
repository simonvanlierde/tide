import { Link, Route, Routes, useLocation } from "react-router-dom";
import { routes } from "./routes";

const utilityRoutes = [
  { path: "/", label: "Today", icon: "◉" },
  { path: "/history", label: "History", icon: "◷" },
  { path: "/settings", label: "Settings", icon: "⚙" }
] as const;

function UtilityNav() {
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="app-header__title">
        {location.pathname === "/" ? "Today" : location.pathname === "/history" ? "History" : "Settings"}
      </div>

      <nav aria-label="Utility navigation" className="utility-nav">
        {utilityRoutes.map((route) => (
          <Link
            key={route.path}
            to={route.path}
            aria-label={route.label}
            className={location.pathname === route.path ? "icon-button is-active" : "icon-button"}
          >
            <span aria-hidden="true">{route.icon}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function App() {
  return (
    <main className="app-shell">
      <UtilityNav />
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </main>
  );
}
