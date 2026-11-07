import { describe, expect, it } from "vitest";
import { newestFirst } from "./history";

describe("newestFirst", () => {
  it("puts the newest-received work order first, whichever way its time is written", () => {
    const orders = [
      { id: "old", receivedAt: "19/10/2026, 09:00:00" },
      { id: "iso", receivedAt: "2026-10-21T08:00:00Z" },
      { id: "new", receivedAt: "20/10/2026, 09:00:00" },
    ];
    expect([...orders].sort(newestFirst).map((o) => o.id)).toEqual(["iso", "new", "old"]);
  });
});
