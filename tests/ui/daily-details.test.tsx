import { act, fireEvent, render, screen } from "@testing-library/react";
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
        <DailyDetails today="2026-04-18" />
      </AppStateProvider>,
    );
    if (opened) {
      await user.click(screen.getByRole("button", { name: "Add details" }));
      await user.click(screen.getByRole("button", { name: "Cancel" }));
    }
    view.rerender(
      <AppStateProvider initialState={state}>
        <DailyDetails today="2026-04-19" />
      </AppStateProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Add details" }));
    expect(screen.getByLabelText("Date")).toHaveValue("2026-04-19");
    await user.type(screen.getByRole("textbox", { name: /note/i }), "A new day.");
    await user.click(screen.getByRole("button", { name: "Save details" }));
    expect(Object.keys(stored().detailsByDay)).toEqual(["2026-04-19"]);
  });

  it("preserves an open draft's date across midnight", async () => {
    const user = userEvent.setup();
    const state = createAppState();
    const view = render(
      <AppStateProvider initialState={state}>
        <DailyDetails today="2026-04-18" />
      </AppStateProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Add details" }));
    await user.type(screen.getByRole("textbox", { name: /note/i }), "Before midnight.");
    view.rerender(
      <AppStateProvider initialState={state}>
        <DailyDetails today="2026-04-19" />
      </AppStateProvider>,
    );
    expect(screen.getByLabelText("Date")).toHaveValue("2026-04-18");
    await user.click(screen.getByRole("button", { name: "Save details" }));
    expect(stored().detailsByDay["2026-04-18"].note).toBe("Before midnight.");
  });

  it("saves symptoms, mood and a note without logging bleeding", async () => {
    const user = userEvent.setup();
    renderWithAppState(<TodayScreen today="2026-04-18" />, { state: createAppState() });
    expect(screen.queryByRole("textbox", { name: /note/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add details" }));
    await user.click(screen.getByRole("checkbox", { name: "Cramps" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Mood" }), "low");
    await user.type(screen.getByRole("textbox", { name: /note/i }), "Rest helped.");
    await user.click(screen.getByRole("button", { name: "Save details" }));
    expect(stored().detailsByDay["2026-04-18"]).toEqual({
      symptoms: ["cramps"],
      mood: "low",
      note: "Rest helped.",
    });
    expect(stored().intensityByDay).toEqual({});
    expect(screen.getByRole("status")).toHaveTextContent("Details saved.");
  });

  it("keeps no symptoms distinct from unlogged and makes clearing explicit", async () => {
    const user = userEvent.setup();
    renderWithAppState(<TodayScreen today="2026-04-18" />, { state: createAppState() });
    await user.click(screen.getByRole("button", { name: "Add details" }));
    await user.click(screen.getByRole("checkbox", { name: "No symptoms" }));
    await user.click(screen.getByRole("button", { name: "Save details" }));
    expect(stored().detailsByDay["2026-04-18"].symptoms).toEqual([]);
    await user.click(screen.getByRole("button", { name: "Clear details" }));
    expect(stored().detailsByDay["2026-04-18"].symptoms).toEqual([]);
    await user.click(screen.getByRole("button", { name: "Save details" }));
    expect(stored().detailsByDay).toEqual({});
  });

  it("keeps a dirty draft on its date and cancel leaves storage untouched", async () => {
    const user = userEvent.setup();
    renderWithAppState(<TodayScreen today="2026-04-18" />, { state: createAppState() });
    await user.click(screen.getByRole("button", { name: "Add details" }));
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-04-12" } });
    await user.type(screen.getByRole("textbox", { name: /note/i }), "Draft");
    expect(screen.getByLabelText("Date")).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(stored().detailsByDay).toEqual({});
  });

  it("does not overwrite another tab's changes to the same day", async () => {
    const user = userEvent.setup();
    renderWithAppState(<TodayScreen today="2026-04-18" />, { state: createAppState() });
    await user.click(screen.getByRole("button", { name: "Add details" }));
    await user.type(screen.getByRole("textbox", { name: /note/i }), "My draft");
    const other = {
      ...stored(),
      schemaVersion: SCHEMA_VERSION,
      detailsByDay: { "2026-04-18": { symptoms: null, mood: null, note: "Other tab" } },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(other));
    act(() => window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY })));
    expect(screen.getByRole("alert")).toHaveTextContent("changed in another tab");
    expect(screen.getByRole("button", { name: "Save details" })).toBeDisabled();
    expect(stored().detailsByDay["2026-04-18"].note).toBe("Other tab");
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
    expect(stored().intensityByDay).toEqual({});
  });
});
