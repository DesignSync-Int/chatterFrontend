import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MessageItem from "../MessageItem";

describe("MessageItem Component", () => {
  it("should render a sent message correctly", () => {
    const mockMessage = {
      content: "Hello, this is a sent message!",
      senderId: "1",
      recipientId: "2",
    };

    render(
      <MessageItem message={mockMessage} type="sent" isNotRecent={false} />
    );

    const messageElement = screen.getByText("Hello, this is a sent message!");
    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveStyle("background-color: #F0F4FC");
    expect(messageElement).toHaveClass("self-start");
  });

  it("should render a received message correctly", () => {
    const mockMessage = {
      content: "Hello, this is a received message!",
      senderId: "2",
      recipientId: "1",
    };

    render(
      <MessageItem message={mockMessage} type="received" isNotRecent={false} />
    );

    const messageElement = screen.getByText(
      "Hello, this is a received message!"
    );
    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveStyle("background-color: #FB3F6B");
    expect(messageElement).toHaveClass("self-end");
  });

  it("should apply the 'mt-[20px]' class when isNotRecent is true", () => {
    const mockMessage = {
      content: "This is a recent message!",
      senderId: "1",
      recipientId: "2",
    };

    render(
      <MessageItem message={mockMessage} type="sent" isNotRecent={true} />
    );

    const messageElement = screen.getByText("This is a recent message!");
    expect(messageElement).toHaveClass("mt-[20px]");
  });

  it("should not apply the 'mt-[20px]' class when isNotRecent is false", () => {
    const mockMessage = {
      content: "This is a recent message!",
      senderId: "1",
      recipientId: "2",
    };

    render(
      <MessageItem message={mockMessage} type="sent" isNotRecent={false} />
    );

    const messageElement = screen.getByText("This is a recent message!");
    expect(messageElement).not.toHaveClass("mt-[20px]");
  });
});
