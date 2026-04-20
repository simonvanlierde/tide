import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../../src/app/App";

describe("App shell", () => {
  it("derives the active screen title and primary navigation from route metadata", () => {
    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText(/^settings$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /primary navigation/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/today/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/history/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/settings/i)).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
