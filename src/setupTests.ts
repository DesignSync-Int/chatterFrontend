import "@testing-library/jest-dom";
import { vi } from "vitest";

declare global {
  var localStorage: Storage;
}

global.localStorage = {
  getItem: vi.fn(() => null), // Return null by default
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
} as unknown as Storage;

Object.defineProperty(global, "localStorage", {
  value: {
    store: {} as Record<string, string>,
    getItem(key: string) {
      return this.store[key] || null;
    },
    setItem(key: string, value: string) {
      this.store[key] = value;
    },
    removeItem(key: string) {
      delete this.store[key];
    },
    clear() {
      this.store = {};
    },
  },
  writable: true,
});
