import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Button from "./button";

describe("Button", () => {
  it("renders the Save button", () => {
    render(<Button />);

    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
