import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SCHEMA_VERSION } from "../../src/data/schema";
import { STORAGE_KEY } from "../../src/data/storage";
import { DayEditor } from "../../src/features/log/DayEditor";
import { AppStateProvider } from "../../src/state/provider";
import { createAppState, renderWithAppState } from "../support/app";

const day = "2026-04-18";
const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");

describe("shared dated day editor", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("focuses the floating editor without scrolling its calendar or Today context", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    const frame = vi.spyOn(window, "requestAnimationFrame");
    renderWithAppState(<DayEditor day={day} today={day} onClose={() => {}} />, { state: createAppState() });
    expect(screen.getByRole("region", { name: "April 18, 2026" })).toHaveAttribute("data-floating", "true");
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(frame).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Log bleeding" }));
    expect(screen.getByRole("radio", { name: "Spotting" })).toHaveFocus();
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: true });
  });

  it("adapts to an inline editor when the responsive query stops matching", () => {
    let change: (() => void) | undefined;
    const media = {
      matches: true,
      addEventListener: vi.fn((_event: string, listener: () => void) => {
        change = listener;
      }),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) =>
        query.includes("max-width: 600px")
          ? media
          : { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      ),
    );
    renderWithAppState(<DayEditor day={day} today={day} onClose={() => {}} />, { state: createAppState() });
    media.matches = false;
    fireEvent(window, new Event("resize"));
    act(() => change?.());
    expect(screen.getByRole("region", { name: "April 18, 2026" })).toHaveAttribute("data-floating", "false");
  });

  it("keeps focus and draft text when the viewport changes to inline while editing a note", async () => {
    const user = userEvent.setup();
    let change: (() => void) | undefined;
    const media = {
      matches: true,
      addEventListener: vi.fn((_event: string, listener: () => void) => {
        change = listener;
      }),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) =>
        query.includes("max-width: 600px")
          ? media
          : { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      ),
    );
    renderWithAppState(<DayEditor day={day} today={day} initialSection="details" onClose={() => {}} />, {
      state: createAppState(),
    });
    const note = screen.getByRole("textbox", { name: /note/i });
    await user.type(note, "Keep typing");
    expect(note).toHaveFocus();
    media.matches = false;
    act(() => change?.());
    expect(note).toHaveFocus();
    expect(note).toHaveValue("Keep typing");
    expect(screen.getByRole("region", { name: "April 18, 2026" })).toHaveAttribute("data-floating", "false");
  });

  it("keeps the floating editor above a resized visual viewport and releases its listeners", () => {
    const viewport = Object.assign(new EventTarget(), { height: 800, offsetTop: 0 });
    vi.stubGlobal("visualViewport", viewport);
    vi.stubGlobal("innerHeight", 800);
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
    const remove = vi.spyOn(viewport, "removeEventListener");
    const view = renderWithAppState(<DayEditor day={day} today={day} onClose={() => {}} />, {
      state: createAppState(),
    });
    const panel = screen.getByRole("region", { name: "April 18, 2026" });
    expect(panel.style.getPropertyValue("--day-editor-bottom")).toBe("88px");
    viewport.height = 350;
    viewport.dispatchEvent(new Event("resize"));
    expect(panel.style.getPropertyValue("--day-editor-bottom")).toBe("458px");
    expect(panel.style.getPropertyValue("--day-editor-available-height")).toBe("326px");
    view.unmount();
    expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
  });

  it("reveals a focused diary control inside the sheet without scrolling the page", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains("day-editor__body")) return DOMRect.fromRect({ y: 100, height: 100 });
      if (this.textContent === "Cramps") return DOMRect.fromRect({ y: 250, height: 44 });
      return DOMRect.fromRect({});
    });
    const view = renderWithAppState(<DayEditor day={day} today={day} initialSection="details" onClose={() => {}} />, {
      state: createAppState(),
    });
    const body = screen.getByRole("region", { name: "April 18, 2026" }).querySelector(".day-editor__body");
    expect(body?.scrollTop).toBe(94);
    expect(screen.getByRole("button", { name: "Cramps" })).toHaveFocus();
    expect(window.scrollY).toBe(0);
    if (body) body.scrollTop = 300;
    view.rerender(
      <AppStateProvider>
        <DayEditor day="2026-04-17" today={day} initialSection="details" onClose={() => {}} />
      </AppStateProvider>,
    );
    expect(body?.scrollTop).toBe(94);
    expect(window.scrollY).toBe(0);
  });

  it("starts with bleeding and keeps optional diary fields collapsed", () => {
    renderWithAppState(<DayEditor day={day} today={day} onClose={() => {}} />, { state: createAppState() });
    expect(screen.getByRole("heading", { name: /April 18, 2026/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log bleeding" })).toHaveFocus();
    expect(screen.getByText("More details").closest("details")).not.toHaveAttribute("open");
    expect(screen.queryByLabelText("Date")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Close" })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Done" })).not.toBeInTheDocument();
  });

  it("focuses the existing flow selection", () => {
    renderWithAppState(<DayEditor day={day} today={day} onClose={() => {}} />, {
      state: createAppState({ periodDays: [day] }),
    });
    expect(screen.getByRole("radio", { name: "Medium" })).toHaveFocus();
  });

  it("opens details without recording bleeding and saves diary fields independently", async () => {
    const user = userEvent.setup();
    renderWithAppState(<DayEditor day={day} today={day} initialSection="details" onClose={() => {}} />, {
      state: createAppState(),
    });
    expect(screen.getByRole("button", { name: "Cramps" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Cramps" }));
    expect(stored().intensityByDay).toEqual({});
    expect(stored().detailsByDay[day].symptoms).toEqual(["cramps"]);
  });

  it("logs, changes flow, and removes bleeding without clearing details or losing focus", async () => {
    const user = userEvent.setup();
    renderWithAppState(<DayEditor day={day} today={day} onClose={() => {}} />, {
      state: createAppState({
        detailsByDay: { [day]: { symptoms: null, mood: null, note: "Keep me" } },
        settings: { calendarHelpDismissed: false },
      }),
    });
    await user.click(screen.getByRole("button", { name: "Log bleeding" }));
    expect(stored().intensityByDay[day]).toBeNull();
    expect(stored().settings.calendarHelpDismissed).toBe(false);
    expect(screen.getByRole("radio", { name: "Spotting" })).toHaveFocus();
    await user.click(screen.getByRole("radio", { name: "Heavy" }));
    expect(stored().intensityByDay[day]).toBe("heavy");
    expect(screen.getByRole("radio", { name: "Heavy" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Not bleeding that day" }));
    expect(stored().intensityByDay).toEqual({});
    expect(stored().detailsByDay[day].note).toBe("Keep me");
    expect(screen.getByRole("button", { name: "Log bleeding" })).toHaveFocus();
  });

  it("allows removing an existing future log but never adds future bleeding or details", async () => {
    const user = userEvent.setup();
    renderWithAppState(<DayEditor day="2026-04-20" today={day} initialSection="details" onClose={() => {}} />, {
      state: createAppState({ periodDays: ["2026-04-20"] }),
    });
    expect(screen.getByRole("radio", { name: "Heavy" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cramps" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Not bleeding that day" }));
    expect(screen.getByRole("button", { name: "Log bleeding" })).toBeDisabled();
    expect(stored().intensityByDay).toEqual({});
  });

  it("writes nothing in read-only mode and supports closing with Escape", () => {
    const close = vi.fn();
    const raw = JSON.stringify({ ...createAppState({ periodDays: [day] }), schemaVersion: SCHEMA_VERSION + 1 });
    localStorage.setItem(STORAGE_KEY, raw);
    render(
      <AppStateProvider>
        <DayEditor day={day} today={day} initialSection="details" onClose={close} />
      </AppStateProvider>,
    );
    expect(screen.getByRole("radio", { name: "Heavy" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Not bleeding that day" })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("button", { name: "Close" }), { key: "Escape" });
    expect(close).toHaveBeenCalledOnce();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
  });
});

describe("shared editor diary actions", () => {
  it("keeps optional details open across flow changes and preserves clear/Undo focus", async () => {
    const user = userEvent.setup();
    renderWithAppState(<DayEditor day={day} today={day} initialSection="details" onClose={() => {}} />, {
      state: createAppState({
        periodDays: [day],
        detailsByDay: { [day]: { symptoms: ["cramps"], mood: null, note: "Keep this" } },
      }),
    });
    await user.click(screen.getByRole("radio", { name: "Light" }));
    expect(screen.getByText("More details").closest("details")).toHaveAttribute("open");
    await user.click(screen.getByRole("button", { name: "Clear details" }));
    expect(stored().detailsByDay).toEqual({});
    expect(screen.getByRole("button", { name: "Undo" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(stored().detailsByDay[day].note).toBe("Keep this");
    expect(screen.getByRole("button", { name: "Clear details" })).toHaveFocus();
    expect(stored().intensityByDay[day]).toBe("light");
  });
});
