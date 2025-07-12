import { formatTimestamp } from "../time";

describe("formatTimestamp", () => {
  it("formats a timestamp as 'Today, HH:mm' if the date is today", () => {
    const now = new Date();
    const timestamp = now.toISOString();
    const formatted = formatTimestamp(timestamp);

    const expectedTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    expect(formatted).toBe(`Today, ${expectedTime}`);
  });

  it("formats a timestamp as 'DD MMM YYYY, HH:mm' if the date is not today", () => {
    const timestamp = new Date("2025-07-03T14:30:00Z").toISOString();
    const formatted = formatTimestamp(timestamp);

    const expectedDate = new Date("2025-07-03T14:30:00Z").toLocaleDateString(
      [],
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
    const expectedTime = new Date("2025-07-03T14:30:00Z").toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    expect(formatted).toBe(`${expectedDate}, ${expectedTime}`);
  });
});
