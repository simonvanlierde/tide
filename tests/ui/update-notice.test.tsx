import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/app/App";
import { checkForUpdatesOnResume, setUpdateAction } from "../../src/app/updateNotice";
import { renderWithAppState } from "../support/app";

afterEach(() => act(() => setUpdateAction(null)));

describe("update notice", () => {
  it("shows nothing until a new version waits, without moving focus", () => {
    renderWithAppState(<App />);
    const status = screen.getByRole("status");
    expect(status).toBeEmptyDOMElement();
    const focused = document.activeElement;
    act(() => setUpdateAction(vi.fn()));
    expect(status).toHaveTextContent("A new version is ready");
    expect(document.activeElement).toBe(focused);
  });

  it("reloads only when Reload is pressed", async () => {
    const apply = vi.fn();
    renderWithAppState(<App />);
    act(() => setUpdateAction(apply));
    expect(apply).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Reload" }));
    expect(apply).toHaveBeenCalledOnce();
  });
});

describe("checking for updates on resume", () => {
  function setup() {
    let now = 1_000_000;
    const registration = { update: vi.fn().mockResolvedValue(undefined) };
    const doc = new EventTarget() as unknown as Document & { visibilityState: string };
    doc.visibilityState = "visible";
    checkForUpdatesOnResume(registration as unknown as ServiceWorkerRegistration, doc, () => now);
    const resume = (after: number) => {
      now += after;
      doc.dispatchEvent(new Event("visibilitychange"));
    };
    return { registration, doc, resume };
  }

  it("checks at most once an hour", () => {
    const { registration, resume } = setup();
    resume(60_000);
    expect(registration.update).not.toHaveBeenCalled();
    resume(3_600_000);
    expect(registration.update).toHaveBeenCalledTimes(1);
    resume(60_000);
    expect(registration.update).toHaveBeenCalledTimes(1);
    resume(3_600_000);
    expect(registration.update).toHaveBeenCalledTimes(2);
  });

  it("ignores a page that is hiding, and an offline failure", () => {
    const { registration, doc, resume } = setup();
    doc.visibilityState = "hidden";
    resume(7_200_000);
    expect(registration.update).not.toHaveBeenCalled();
    doc.visibilityState = "visible";
    registration.update.mockRejectedValue(new Error("offline"));
    expect(() => resume(7_200_000)).not.toThrow();
  });
});
