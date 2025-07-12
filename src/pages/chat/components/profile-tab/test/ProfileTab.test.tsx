import { render, screen } from "@testing-library/react";
import ProfileTab from "../ProfileTab";
import useUserStore from "../../../../../store/user.store";

describe("ProfileTab Component", () => {
  beforeEach(() => {
    useUserStore.setState({
      currentRecipient: {
        _id: '1',
        name: 'Recipient User',
        profile: 'https://randomuser.me/api/portraits',
      },
    });
  });

  it("renders the UserCard when currentRecipient exists", () => {
    render(<ProfileTab />);
    expect(screen.getByText("Recipient User")).toBeInTheDocument();
  });

  it("renders the placeholder text", () => {
    render(<ProfileTab />);
    expect(
      screen.getByText(
        "This tab is a placeholder - no improvements are needed."
      )
    ).toBeInTheDocument();
  });

  it("does not render UserCard when currentRecipient is null", () => {
    useUserStore.setState({
      currentRecipient: null,
    });
    render(<ProfileTab />);
    expect(screen.queryByText("Recipient User")).toBeNull();
  });
});
