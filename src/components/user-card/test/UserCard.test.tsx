import { render, screen } from "@testing-library/react";
import UserCard from "../UserCard";

describe("UserCard Component", () => {
  it("renders the user's profile image and name", () => {
    const mockUser = {
      _id: 1,
      name: "John Doe",
      profile: "https://example.com/profile.jpg",
    };

    render(<UserCard user={mockUser} />);

    const image = screen.getByRole("img", { name: /john doe/i });
    const name = screen.getByText(/john doe/i);

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", mockUser.profile);
    expect(image).toHaveAttribute("alt", mockUser.name);
    expect(name).toBeInTheDocument();
  });

  it("applies correct styles to the user card", () => {
    const mockUser = {
      _id: 1,
      name: "Jane Doe",
      profile: "https://example.com/profile.jpg",
    };

    render(<UserCard user={mockUser} />);

    const container = screen.getByText(/jane doe/i).parentElement;
    expect(container).toHaveClass("flex gap-2.5 items-center justify-center");
  });
});
