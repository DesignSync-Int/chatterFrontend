import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../Button";
import { vi } from "vitest";

describe("Button Component", () => {
  it("renders the button with correct text", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("handles the onClick event", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables the button when the disabled prop is true", () => {
    render(<Button disabled>Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeDisabled();
  });

  it("sets the correct button type", () => {
    render(<Button buttonType="submit">Submit</Button>);
    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).toHaveAttribute("type", "submit");
  });

  it("applies hover styles when not disabled", () => {
    render(<Button>Hover Me</Button>);
    const button = screen.getByRole("button", { name: /hover me/i });
    expect(button).toHaveClass("hover:bg-[#cc3d59]");
  });

  //   it("does not apply hover styles when disabled", () => {
  //     render(<Button disabled>Hover Me</Button>);
  //     const button = screen.getByRole("button", { name: /hover me/i });
  //     // expect(button).not.toHaveClass("hover:bg-[#cc3d59]");
  //   });
});
