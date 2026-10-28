import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import DatePicker from "./index";
import { useState } from "react";

vi.mock("@/services/utilities", () => ({
  Formatter: { date: (date) => date.toLocaleDateString("en-US") },
}));

afterEach(cleanup);

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

const openDropdown = (trigger) => {
  fireEvent.keyDown(trigger, { key: "Enter" });
  return screen.getByRole("listbox");
};

const chooseOption = (trigger, name) => {
  const list = openDropdown(trigger);
  fireEvent.keyDown(within(list).getByRole("option", { name }), { key: "Enter" });
};

const expectMissingOption = (trigger, name) => {
  const list = openDropdown(trigger);
  expect(within(list).queryByRole("option", { name })).not.toBeInTheDocument();
  fireEvent.keyDown(list, { key: "Escape" });
};

describe("DatePicker range navigation", () => {
  it("lets each calendar change its month and year independently without changing the selection", () => {
    const setDate = vi.fn();
    render(
      <DatePicker
        mode="range"
        captionLayout="dropdown"
        date={{ from: new Date(2026, 0, 10), to: new Date(2026, 2, 20) }}
        setDate={setDate}
      />,
    );
    fireEvent.click(screen.getByRole("button"));

    const months = screen.getAllByRole("combobox", { name: "Choose the Month" });
    const years = screen.getAllByRole("combobox", { name: "Choose the Year" });
    expect(months[0]).toHaveTextContent("Jan");
    expect(months[1]).toHaveTextContent("Mar");

    expectMissingOption(months[0], "Apr");
    expectMissingOption(years[1], "2025");

    chooseOption(months[0], "Feb");
    expect(months[0]).toHaveTextContent("Feb");
    expect(months[1]).toHaveTextContent("Mar");
    expectMissingOption(months[1], "Jan");

    chooseOption(years[0], "2025");
    expect(years[0]).toHaveTextContent("2025");
    expect(years[1]).toHaveTextContent("2026");
    const list = openDropdown(years[1]);
    expect(within(list).getByRole("option", { name: "2025" })).toBeInTheDocument();
    fireEvent.keyDown(list, { key: "Escape" });
    expect(setDate).not.toHaveBeenCalled();
  });

  it("keeps the displayed months distinct and blocks navigation into the other calendar", () => {
    render(
      <DatePicker
        mode="range"
        captionLayout="dropdown"
        date={{ from: new Date(2026, 0, 10), to: new Date(2026, 2, 20) }}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    const months = screen.getAllByRole("combobox", { name: "Choose the Month" });
    chooseOption(months[0], "Feb");
    expect(months[0]).toHaveTextContent("Feb");
    expect(months[1]).toHaveTextContent("Mar");
    const nextFrom = screen.getAllByRole("button", { name: "Go to the Next Month" })[0];
    const previousTo = screen.getAllByRole("button", { name: "Go to the Previous Month" })[1];
    expect(nextFrom).toHaveAttribute("aria-disabled", "true");
    expect(previousTo).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(nextFrom);
    fireEvent.click(previousTo);
    expect(months[0]).toHaveTextContent("Feb");
    expect(months[1]).toHaveTextContent("Mar");
    expectMissingOption(months[1], "Feb");
    expectMissingOption(months[0], "Mar");
  });

  it.each(["", "dropdown"])("preserves date range selection with caption layout '%s'", (captionLayout) => {
    const onChange = vi.fn();
    function RangeExample() {
      const [date, setDate] = useState({
        from: new Date(2026, 0, 10),
        to: new Date(2026, 1, 20),
      });
      return <DatePicker mode="range" captionLayout={captionLayout} date={date} setDate={(next) => {
        setDate(next);
        onChange(next);
      }} />;
    }
    const { container } = render(<RangeExample />);
    fireEvent.click(screen.getByRole("button"));
    const calendars = screen.getAllByRole("grid");
    fireEvent.click(within(calendars[0]).getByRole("button", { name: /January 5th, 2026/ }));
    fireEvent.click(within(calendars[1]).getByRole("button", { name: /February 25th, 2026/ }));
    expect(onChange).toHaveBeenLastCalledWith({ from: new Date(2026, 0, 5), to: new Date(2026, 1, 25) });
    expect(within(container).getByRole("button")).toHaveTextContent("1/5/2026 - 2/25/2026");
  });

  it("starts with consecutive months when both endpoints are in the same month", () => {
    render(
      <DatePicker
        mode="range"
        captionLayout="dropdown"
        date={{ from: new Date(2026, 0, 10), to: new Date(2026, 0, 20) }}
      />,
    );
    fireEvent.click(screen.getByRole("button"));

    const months = screen.getAllByRole("combobox", { name: "Choose the Month" });
    expect(months[0]).toHaveTextContent("Jan");
    expect(months[1]).toHaveTextContent("Feb");
  });

  it("uses linked months without dropdowns or the 2025 limit by default", () => {
    render(
      <DatePicker
        mode="range"
        date={{ from: new Date(2024, 0, 10), to: new Date(2024, 1, 20) }}
      />,
    );
    fireEvent.click(screen.getByRole("button"));

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText("January 2024")).toBeInTheDocument();
    expect(screen.getByText("February 2024")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Go to the Next Month" }));
    expect(screen.queryByText("January 2024")).not.toBeInTheDocument();
    expect(screen.getByText("February 2024")).toBeInTheDocument();
    expect(screen.getByText("March 2024")).toBeInTheDocument();
  });
});
