import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("Home", () => {
  it("renders the start screen first", async () => {
    render(await Home({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("CoupleDating")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "시작하기" })).toBeInTheDocument();
  });

  it("can start from the selection screen", async () => {
    render(await Home({ searchParams: Promise.resolve({ start: "1" }) }));

    expect(screen.getByText("상황 선택")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "추천받기" })).toBeInTheDocument();
  });
});
