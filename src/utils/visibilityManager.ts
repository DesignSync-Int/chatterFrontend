import React from "react";

/**
 * Utility for detecting browser tab/window visibility and focus state
 */

export class VisibilityManager {
  private static instance: VisibilityManager;
  private isVisible = true;
  private isFocused = true;
  private listeners: Array<(isVisible: boolean, isFocused: boolean) => void> =
    [];

  private constructor() {
    this.setupListeners();
  }

  static getInstance(): VisibilityManager {
    if (!VisibilityManager.instance) {
      VisibilityManager.instance = new VisibilityManager();
    }
    return VisibilityManager.instance;
  }

  private setupListeners() {
    // Handle visibility change (tab switching)
    document.addEventListener("visibilitychange", () => {
      this.isVisible = !document.hidden;
      this.notifyListeners();
    });

    // Handle window focus/blur
    window.addEventListener("focus", () => {
      this.isFocused = true;
      this.notifyListeners();
    });

    window.addEventListener("blur", () => {
      this.isFocused = false;
      this.notifyListeners();
    });

    // Handle page show/hide (for better browser support)
    window.addEventListener("pageshow", () => {
      this.isVisible = true;
      this.isFocused = true;
      this.notifyListeners();
    });

    window.addEventListener("pagehide", () => {
      this.isVisible = false;
      this.isFocused = false;
      this.notifyListeners();
    });
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      listener(this.isVisible, this.isFocused);
    });
  }

  /**
   * Returns true if the browser tab is visible and focused
   */
  isTabActive(): boolean {
    return this.isVisible && this.isFocused;
  }

  /**
   * Returns true if the browser tab is visible (but may not be focused)
   */
  isTabVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Returns true if the window has focus
   */
  isWindowFocused(): boolean {
    return this.isFocused;
  }

  /**
   * Subscribe to visibility changes
   */
  onVisibilityChange(
    callback: (isVisible: boolean, isFocused: boolean) => void
  ) {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// Export a singleton instance
export const visibilityManager = VisibilityManager.getInstance();

// Export hook for React components
export const useTabVisibility = () => {
  const [isVisible, setIsVisible] = React.useState(
    visibilityManager.isTabVisible()
  );
  const [isFocused, setIsFocused] = React.useState(
    visibilityManager.isWindowFocused()
  );

  React.useEffect(() => {
    const unsubscribe = visibilityManager.onVisibilityChange(
      (visible, focused) => {
        setIsVisible(visible);
        setIsFocused(focused);
      }
    );

    return unsubscribe;
  }, []);

  return {
    isVisible,
    isFocused,
    isActive: isVisible && isFocused,
  };
};
