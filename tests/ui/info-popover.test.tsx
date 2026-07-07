import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InfoPopover } from "../../src/features/settings/InfoPopover";

function renderPopover() {
  render(
    <InfoPopover label="More info">
      <p>Details here</p>
    </InfoPopover>,
  );
  const details = screen.getByText("Details here").closest("details");
  if (!details) throw new Error("details element not found");
  return details;
}

describe("InfoPopover", () => {
  it("closes when a pointer lands outside the popover", async () => {
    const user = userEvent.setup();
    const details = renderPopover();

    await user.click(screen.getByLabelText("More info"));
    expect(details.open).toBe(true);

    fireEvent.pointerDown(document.body);
    expect(details.open).toBe(false);
  });

  it("flips above the trigger when it would overflow the bottom edge", async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 200,
    });
    const rectSpy = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockReturnValue({
        bottom: 500,
        top: 480,
        left: 10,
        right: 20,
        width: 10,
        height: 20,
        x: 10,
        y: 480,
        toJSON: () => ({}),
      } as DOMRect);

    renderPopover();
    const content = screen.getByRole("note");

    await user.click(screen.getByLabelText("More info"));
    expect(content.classList.contains("info-popover__content--above")).toBe(
      true,
    );

    rectSpy.mockRestore();
  });
});
