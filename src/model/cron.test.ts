import { describe, expect, it } from "vitest";
import { cronProblem, describeCron, frequencyOf, withFrequency } from "./cron";

describe("cron", () => {
  it("reads the common shapes in words", () => {
    expect(describeCron("0 * * * *")).toBe("Every hour");
    expect(describeCron("15 * * * *")).toBe("Every hour at minute 15");
    expect(describeCron("0 6 * * *")).toBe("Every day at 06:00");
    expect(describeCron("30 6 * * 1")).toBe("Every Monday at 06:30");
    expect(describeCron("0 0 1 * *")).toBe("On day 1 of every month at 00:00");
    expect(describeCron("0 9-17 * * 1-5")).toBe("On the schedule 0 9-17 * * 1-5");
  });

  it("knows which frequency an expression is", () => {
    expect(frequencyOf("5 4 * * *")).toBe("daily");
    expect(frequencyOf("5 4 * * 0")).toBe("weekly");
    expect(frequencyOf("*/5 * * * *")).toBe("custom");
  });

  it("keeps the time when the frequency changes", () => {
    expect(withFrequency("30 6 * * *", "weekly")).toBe("30 6 * * 1");
    expect(withFrequency("30 6 * * 1", "hourly")).toBe("30 * * * *");
    expect(withFrequency("*/5 * * * *", "daily")).toBe("0 0 * * *");
    expect(withFrequency("*/5 * * * *", "custom")).toBe("*/5 * * * *");
  });

  it("says what's wrong with a schedule that doesn't read", () => {
    expect(cronProblem("0 6 * * *")).toBeUndefined();
    expect(cronProblem("*/15 9-17 * * 1-5")).toBeUndefined();
    expect(cronProblem("")).toBe("Enter a schedule");
    expect(cronProblem("0 6 * *")).toMatch(/five fields/);
    expect(cronProblem("0 25 * * *")).toMatch(/hour \(25\)/);
  });
});
