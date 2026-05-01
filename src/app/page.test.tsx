import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("Home", () => {
  it("renders the mobile MVP home form", () => {
    render(<Home />);

    expect(screen.getByText("CoupleDating")).toBeInTheDocument();
    expect(screen.getByText("먼저 골라볼까요?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "현위치" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "추천받기 ♥" })).toBeInTheDocument();
  });
});
