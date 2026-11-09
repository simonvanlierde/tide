import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SCHEMA_VERSION, STORAGE_KEY } from "../../src/data/schema";
import { CycleHistory } from "../../src/features/today/CycleHistory";
import { addDays } from "../../src/utils/date";
import { createAppState, renderWithAppState } from "../support/app";

describe("CycleHistory", () => {
  it("explains how to build history until another period starts", () => {
    renderWithAppState(<CycleHistory today="2026-04-15" />, {
      state: createAppState({ periodDays: ["2026-04-01"] }),
    });
    expect(screen.getByText(/Log the start of another period/)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("describes a single completed cycle without a count", () => {
    renderWithAppState(<CycleHistory today="2026-04-15" />, {
      state: createAppState({ periodDays: ["2026-02-01", "2026-03-01"], settings: { language: "en" } }),
    });
    expect(screen.getByText(/Showing the latest cycle\./)).toBeInTheDocument();
  });

  it("shows recorded intervals and reversibly excludes an incomplete cycle without removing logs", () => {
    const days = ["2026-01-01", "2026-01-29", "2026-03-01"] as const;
    renderWithAppState(<CycleHistory today="2026-04-15" />, {
      state: createAppState({ periodDays: [...days], settings: { language: "en" } }),
    });
    const table = screen.getByRole("table", { name: "Cycle history" });
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    expect(within(table).getByText("28")).toBeInTheDocument();
    expect(within(table).getByText("31")).toBeInTheDocument();
    const incomplete = screen.getByRole("checkbox", { name: "Incomplete cycle starting January 1, 2026" });
    fireEvent.click(incomplete);
    expect(incomplete).toBeChecked();
    expect(screen.getByText("Incomplete; excluded from estimates")).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    expect(stored.incompleteCycleStarts).toEqual([days[0]]);
    expect(Object.keys(stored.intensityByDay)).toEqual(days);
    fireEvent.click(incomplete);
    expect(incomplete).not.toBeChecked();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null").incompleteCycleStarts).toEqual([]);
  });

  it("leaves spotting and future logs out of completed cycles", () => {
    renderWithAppState(<CycleHistory today="2026-04-15" />, {
      state: createAppState({
        periodDays: ["2026-01-01", "2026-02-01", "2026-05-01"],
        intensityByDay: { "2026-01-15": "spotting" },
      }),
    });
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    expect(screen.getByRole("table")).toHaveTextContent("31");
  });

  it("keeps the latest twelve completed intervals in chronological order", () => {
    renderWithAppState(<CycleHistory today="2027-04-15" />, {
      state: createAppState({
        periodDays: Array.from({ length: 14 }, (_, index) => addDays("2026-01-01", index * 28)),
        settings: { language: "en" },
      }),
    });
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows).toHaveLength(13);
    expect(rows[1]).toHaveTextContent("January 29, 2026");
    expect(
      screen.queryByRole("checkbox", { name: "Incomplete cycle starting January 1, 2026" }),
    ).not.toBeInTheDocument();
  });

  it("disables incomplete markers when a newer build owns the stored data", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...createAppState({ periodDays: ["2026-01-01", "2026-02-01"] }),
        schemaVersion: SCHEMA_VERSION + 1,
      }),
    );
    renderWithAppState(<CycleHistory today="2026-04-15" />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });
});
