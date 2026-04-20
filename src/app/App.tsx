import { Link, Route, Routes, useLocation } from "react-router-dom";
import { routes } from "./routes";

const utilityRoutes = [
  {
    path: "/",
    label: "Today",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-glyph">
        <path d="M3 10.5 12 3l9 7.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="M5.5 9.5V20h13V9.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    )
  },
  {
    path: "/history",
    label: "History",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-glyph">
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <path d="M8 13h3M8 16.5h3M13.5 13h2.5M13.5 16.5h2.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    )
  },
  {
    path: "/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-glyph">
        <path
          d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Zm8 3.4-.1-1-1.9-.5a6.4 6.4 0 0 0-.7-1.5l1-1.7-.8-.8-1.7.9a6.4 6.4 0 0 0-1.5-.6l-.5-1.9h-1.1l-.5 1.9a6.4 6.4 0 0 0-1.5.6l-1.7-.9-.8.8 1 1.7a6.4 6.4 0 0 0-.7 1.5l-1.9.5v1.1l1.9.5c.1.5.4 1 .7 1.5l-1 1.7.8.8 1.7-.9c.5.3 1 .5 1.5.6l.5 1.9h1.1l.5-1.9c.5-.1 1-.3 1.5-.6l1.7.9.8-.8-1-1.7c.3-.5.5-1 .7-1.5l1.9-.5Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    )
  }
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
