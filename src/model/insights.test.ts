import { describe, expect, it } from "vitest";
import { durationSeconds, insightsFor } from "./insights";
import type { RunDetails, RunStatus, WorkOrder } from "./workflow";

const run = (id: string, status: RunStatus, started: string, duration = "2 s"): RunDetails => ({
  workOrderId: id,
  runId: `${id}-${started}`,
  status,
  duration,
  started,
  when: started,
  startedBy: "Webhook",
  version: "v1",
  inputId: "input",
  steps: [],
  logs: [],
});

const order = (id: string, ...runs: RunDetails[]): WorkOrder => ({ id, status: runs[0]!.status, lastActivity: "", runs });

describe("insightsFor", () => {
  // Run history's "now" is 20 Oct 2026, 10:00 (a Tuesday).
  const a = { id: "a", name: "A", workOrders: [order("1", run("1", "failed", "20/10/2026, 09:00:00", "4 s"), run("1", "success", "19/10/2026, 09:00:00", "2 s"))] };
  const b = { id: "b", name: "B", workOrders: [order("2", run("2", "success", "10/10/2026, 09:00:00"))] };

  it("counts the week's runs and errors, day by day, ending today", () => {
    const week = insightsFor([a, b], "Across all projects", true);
    expect(week.tiles.map((t) => [t.label, t.value])).toEqual([
      ["Runs", "2"],
      ["Errors", "1"],
      ["Error rate", "50.0%"],
      ["Average run time", "3.0s"],
    ]);
    expect(week.daily.map((d) => d.day)).toEqual(["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"]);
    expect(week.daily.slice(-2)).toEqual([
      { day: "Mon", succeeded: 1, failed: 0 },
      { day: "Tue", succeeded: 0, failed: 1 },
    ]);
  });

  it("counts a week as today and the 6 days before it, whole days, and only finished runs", () => {
    const edge = {
      id: "c",
      name: "C",
      workOrders: [
        order("3", run("3", "success", "14/10/2026, 00:30:00")),
        order("4", run("4", "success", "13/10/2026, 23:30:00")),
        order("5", run("5", "running", "20/10/2026, 09:30:00")),
        order("6", run("6", "cancelled", "20/10/2026, 08:30:00")),
      ],
    };
    const week = insightsFor([edge], "", false);
    expect(week.tiles[0]!.value).toBe("1");
    expect(week.daily[0]).toEqual({ day: "Wed", succeeded: 1, failed: 0 });
  });

  it("compares the error rate with the week before", () => {
    expect(insightsFor([a, b], "", false).tiles[2]!.detail).toBe("Up from 0.0% the week before");
    expect(insightsFor([a], "", false).tiles[2]!.detail).toBe("No runs the week before");
  });

  it("gives each project a row across projects, and none inside one", () => {
    expect(insightsFor([a, b], "", true).projects).toEqual([
      { id: "a", name: "A", runs: 2, failed: 1, avgDuration: "3.0s" },
      { id: "b", name: "B", runs: 0, failed: 0, avgDuration: "—" },
    ]);
    expect(insightsFor([a], "This project", false).projects).toEqual([]);
  });

  it("says nothing ran in a quiet week", () => {
    const week = insightsFor([], "This project", false);
    expect(week.tiles.map((t) => t.value)).toEqual(["0", "0", "0.0%", "—"]);
  });
});

describe("durationSeconds", () => {
  it("reads milliseconds, seconds and minutes, and nothing else", () => {
    expect(durationSeconds("211 ms")).toBe(0.211);
    expect(durationSeconds("31 s")).toBe(31);
    expect(durationSeconds("2 min")).toBe(120);
    expect(durationSeconds("soon")).toBeUndefined();
  });
});
