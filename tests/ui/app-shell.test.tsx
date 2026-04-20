import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../../src/app/App";

describe("App shell", () => {
  it("renders utility navigation links with shared icon-library glyphs on a secondary screen", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/settings"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/today/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/history/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/settings/i)).toBeInTheDocument();
    expect(container.querySelectorAll(".utility-nav svg.lucide")).toHaveLength(3);
  });
});
