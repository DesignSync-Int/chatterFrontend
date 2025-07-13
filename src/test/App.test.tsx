import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import App from "../App";
import usePageStore from "../store/page.store";

afterEach(() => {
  usePageStore.setState({ currentPage: "home" });
});

describe("App Component", () => {
  it("renders Home component when currentPage is 'home'", () => {
    const { getByText } = render(<App />);
    expect(getByText('Connect back with your friends in a simple way.')).toBeInTheDocument();
  });
  it("renders Chat component when currentPage is 'chat'", () => {
    usePageStore.setState({ currentPage: 'chat' });

    const { getByText } = render(<App />);
    expect(getByText('Chat')).toBeInTheDocument();
  });

  it('does not render Home or Chat when currentPage is invalid', () => {
    usePageStore.setState({ currentPage: undefined });

    const { queryByText } = render(<App />);
    expect(queryByText('Connect back with your friends in a simple way.')).not.toBeInTheDocument();
    expect(queryByText('Chat')).not.toBeInTheDocument();
  });

  it("provides QueryClient context", () => {
    usePageStore.setState({ currentPage: "home" });

    const { container } = render(<App />);
    expect(container).toMatchSnapshot();
  });
});
