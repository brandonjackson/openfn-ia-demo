import { describe, expect, it } from "vitest";
import { isoAgo, msAgo, timeAgo } from "./time";

const DAY = 86_400_000;

describe("msAgo", () => {
  it.each([
    ["Just now", 30_000],
    ["12 minutes ago", 12 * 60_000],
    ["an hour ago", 3_600_000],
    ["Yesterday", DAY],
    ["1 week ago", 7 * DAY],
    ["Never", null],
    ["14 Mar 2024", null],
  ])("reads %s", (text, ms) => {
    expect(msAgo(text)).toBe(ms);
  });
});

describe("isoAgo", () => {
  it("turns a fixture's words back into a timestamp that timeAgo words the same way, and Never into null", () => {
    const now = Date.parse("2026-11-06T12:00:00Z");
    expect(timeAgo(isoAgo("3 days ago", now), now)).toBe("3 days ago");
    expect(isoAgo("Never", now)).toBeNull();
  });
});
