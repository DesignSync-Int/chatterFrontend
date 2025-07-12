import { describe, it, expect, beforeEach } from "vitest";
import usePageStore from "../page.store";

describe("usePageStore", () => {
  beforeEach(() => {
    // Reset the store state before each test
    usePageStore.setState({
      currentPage: "home",
    });
  });

  it("should have the default currentPage as 'home'", () => {
    const { currentPage } = usePageStore.getState();
    expect(currentPage).toBe("home");
  });

  it("should update currentPage using setCurrentPage", () => {
    usePageStore.getState().setCurrentPage("chat");
    const { currentPage } = usePageStore.getState();
    expect(currentPage).toBe("chat");
  });

  it("should update currentPage to 'profile'", () => {
    usePageStore.getState().setCurrentPage("profile");
    const { currentPage } = usePageStore.getState();
    expect(currentPage).toBe("profile");
  });
});
