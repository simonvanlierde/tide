import { Link, Route, Routes } from "react-router-dom";
import { routes } from "./routes";

export function App() {
  return (
    <main>
      <nav>
        {routes.map((route) => (
          <Link key={route.path} to={route.path}>
            {route.label}
          </Link>
        ))}
      </nav>

      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </main>
  );
}
