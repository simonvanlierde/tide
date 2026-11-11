import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SCHEMA_VERSION } from "../../src/data/schema";
import { STORAGE_KEY } from "../../src/data/storage";
import { CalendarScreen } from "../../src/features/calendar/CalendarScreen";
import { DailyDetails } from "../../src/features/diary/DailyDetails";
import { TodayScreen } from "../../src/features/today/TodayScreen";
import { AppStateProvider } from "../../src/state/provider";
import { createAppState, renderWithAppState } from "../support/app";

function stored() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
}

describe("optional daily details", () => {
  it.each([false, true])("opens today's details after midnight, previously opened: %s", async (opened) => {
    const user = userEvent.setup();
    const state = createAppState();
    const view = render(
      <AppStateProvider initialState={state}>
        <DailyDetails today="2026-04-18" month="2026-04-01" />
      </AppStateProvider>,
    );
    if (opened) {
      await user.click(screen.getByRole("button", { name: "Add details" }));
      await user.click(screen.getByRole("button", { name: "Done" }));
    }
    view.rerender(
      <AppStateProvider initialState={state}>
        <DailyDetails today="2026-04-19" month="2026-04-01" />
      </AppStateProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Add details" }));
    expect(screen.getByLabelText("Date")).toHaveValue("2026-04-19");
    await user.type(screen.getByRole("textbox", { name: /note/i }), "A new day.");
    expect(Object.keys(stored().detailsByDay)).toEqual(["2026-04-19"]);
  });

  it("saves symptoms, mood and a note as they are tapped, without logging bleeding", async () => {
    const user = userEvent.setup();
    renderWithAppState(<TodayScreen today="2026-04-18" />, { state: createAppState() });
    expect(screen.queryByRole("textbox", { name: /note/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add details" }));

    // Opens on the first symptom, with no date to pick: Today's details are today's.
    expect(screen.getByRole("button", { name: "Cramps" })).toHaveFocus();
    expect(screen.queryByLabelText("Date")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cramps" }));
    await user.click(screen.getByRole("button", { name: "Low" }));
    await user.type(screen.getByRole("textbox", { name: /note/i }), "Rest helped.");

    expect(screen.getByRole("button", { name: "Cramps" })).toHaveAttribute("aria-pressed", "true");
    expect(stored().detailsByDay["2026-04-18"]).toEqual({
      symptoms: ["cramps"],
      mood: "low",
      note: "Rest helped.",
    });
    expect(stored().intensityByDay).toEqual({});
    expect(screen.getByRole("status")).toHaveTextContent("Details saved.");
  });

  it("keeps no symptoms distinct from unlogged, and a second tap undoes a choice", async () => {
    const user = userEvent.setup();
    renderWithAppState(<TodayScreen today="2026-04-18" />, { state: createAppState() });
    await user.click(screen.getByRole("button", { name: "Add details" }));
    await user.click(screen.getByRole("button", { name: "No symptoms" }));
    expect(stored().detailsByDay["2026-04-18"].symptoms).toEqual([]);

    await user.click(screen.getByRole("button", { name: "No symptoms" }));
    expect(stored().detailsByDay).toEqual({});

    await user.click(screen.getByRole("button", { name: "Good" }));
    await user.click(screen.getByRole("button", { name: "Good" }));
    expect(stored().detailsByDay).toEqual({});
  });

  it("offers Undo after clearing and keeps focus on the swapped control", async () => {
    const user = userEvent.setup();
    const state = {
      ...createAppState(),
      detailsByDay: { "2026-04-18": { symptoms: ["fatigue" as const], mood: null, note: "Long day." } },
    };
    renderWithAppState(<TodayScreen today="2026-04-18" />, { state });
    await user.click(screen.getByRole("button", { name: "Edit details" }));

    await user.click(screen.getByRole("button", { name: "Clear details" }));
    expect(stored().detailsByDay).toEqual({});
    expect(screen.getByRole("button", { name: "Undo" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(stored().detailsByDay["2026-04-18"].note).toBe("Long day.");
    expect(screen.getByRole("button", { name: "Clear details" })).toHaveFocus();
  });

  it("sits beside the log button and takes focus back when done", async () => {
    const user = userEvent.setup();
    renderWithAppState(<TodayScreen today="2026-04-18" />, { state: createAppState() });
    const details = screen.getByRole("button", { name: "Add details" });
    const log = screen.getByRole("button", { name: /log bleeding today/i });
    expect(details.parentElement).toBe(log.parentElement);
    expect(details).toHaveAttribute("aria-expanded", "false");

    await user.click(details);
    expect(details).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Cramps" }));
    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(screen.queryByRole("button", { name: "Cramps" })).not.toBeInTheDocument();
    const edit = screen.getByRole("button", { name: "Edit details" });
    await act(() => new Promise(requestAnimationFrame));
    expect(edit).toHaveFocus();
  });

  it("shows another tab's change to the same day instead of overwriting it", async () => {
    const user = userEvent.setup();
    renderWithAppState(<TodayScreen today="2026-04-18" />, { state: createAppState() });
    await user.click(screen.getByRole("button", { name: "Add details" }));
    await user.type(screen.getByRole("textbox", { name: /note/i }), "Mine");
    const other = {
      ...stored(),
      schemaVersion: SCHEMA_VERSION,
      detailsByDay: { "2026-04-18": { symptoms: null, mood: null, note: "Other tab" } },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(other));
    act(() => window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY })));
    expect(screen.getByRole("textbox", { name: /note/i })).toHaveValue("Other tab");
  });

  it("lets calendar readers revisit a detail-only day without logging bleeding", async () => {
    const user = userEvent.setup();
    const state = {
      ...createAppState(),
      detailsByDay: {
        "2026-04-12": { symptoms: null, mood: "good" as const, note: "A walk helped." },
      },
    };
    renderWithAppState(<CalendarScreen today="2026-04-18" />, { state });
    await user.click(screen.getByRole("button", { name: /view details for .*12/i }));
    expect(screen.getByRole("textbox", { name: /note/i })).toHaveValue("A walk helped.");
    expect(screen.getByRole("button", { name: "Good" })).toHaveAttribute("aria-pressed", "true");
    expect(stored().intensityByDay).toEqual({});
  });
});
