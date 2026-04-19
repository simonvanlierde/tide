import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../../src/app/App";

describe("App shell", () => {
  it("renders utility navigation links for today, history, and settings on a secondary screen", () => {
    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/today/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/history/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/settings/i)).toBeInTheDocument();
  });
});
