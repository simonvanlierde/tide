import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FlowGauge } from "../../src/features/log/FlowGauge";

describe("FlowGauge", () => {
  it("focuses the first level when auto-focused without a selected level", () => {
    render(<FlowGauge autoFocus onSelect={vi.fn()} />);

    expect(screen.getByRole("radio", { name: /spotting/i })).toHaveFocus();
  });
});
