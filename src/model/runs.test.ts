import { describe, expect, it } from "vitest";
import { stampTime, workOrderActivity } from "./runs";
import type { RunDetails, RunStatus, WorkOrder } from "./workflow";

const run = (id: string, status: RunStatus, started: string): RunDetails => ({
  workOrderId: id,
  runId: `${id}-${started}`,
  status,
  duration: "1s",
  started,
  when: started,
  startedBy: "Webhook",
  version: "v1",
  inputId: "input",
  steps: [],
  logs: [],
});

/** A work order with its runs, given oldest first. */
const order = (id: string, ...runs: [RunStatus, string][]): WorkOrder => {
  const all = runs.map(([status, started]) => run(id, status, started)).reverse();
  return { id, status: all[0].status, lastActivity: all[0].when, runs: all };
};

describe("workOrderActivity", () => {
  const orders = [
    order("a", ["success", "20/10/2026, 09:51:07"]),
    order("b", ["failed", "19/10/2026, 08:00:00"], ["success", "19/10/2026, 09:00:00"]),
    order("c", ["failed", "14/10/2026, 12:00:00"]),
    // Received before the last 7 days, retried within them.
    order("d", ["failed", "10/10/2026, 12:00:00"], ["failed", "15/10/2026, 12:00:00"]),
  ];

  it("counts work orders by when they were received, and every run started in the period", () => {
    const week = workOrderActivity(orders, "7d");
    expect(week).toMatchObject({ workOrders: 3, failedWorkOrders: 1, runs: 5 });
    const month = workOrderActivity(orders, "30d");
    expect(month).toMatchObject({ workOrders: 4, failedWorkOrders: 2, runs: 6 });
  });

  it("adds up day by day to its totals, ending today", () => {
    const { daily, workOrders, failedWorkOrders, runs } = workOrderActivity(orders, "7d");
    expect(daily).toHaveLength(7);
    expect(daily.reduce((n, d) => n + d.workOrders, 0)).toBe(workOrders);
    expect(daily.reduce((n, d) => n + d.failed, 0)).toBe(failedWorkOrders);
    expect(daily.reduce((n, d) => n + d.runs, 0)).toBe(runs);
    expect(daily.at(-1)).toEqual({ workOrders: 1, failed: 0, runs: 1 });
  });

  it("names the latest run, whenever it was", () => {
    expect(workOrderActivity(orders, "24h")).toMatchObject({ latestRun: "success", lastRunAt: "2026-10-20T09:51:07.000Z" });
    expect(workOrderActivity([], "30d")).toMatchObject({ workOrders: 0, runs: 0, latestRun: undefined, lastRunAt: undefined });
  });
});

describe("stampTime", () => {
  it("reads the fixtures' stamps and Lightning's ISO timestamps alike", () => {
    expect(stampTime("20/10/2026, 09:30:00")).toBe(new Date(2026, 9, 20, 9, 30, 0).getTime());
    expect(stampTime("2026-10-20T09:30:00Z")).toBe(Date.UTC(2026, 9, 20, 9, 30, 0));
  });

  it("doesn't guess at anything else", () => {
    expect(stampTime("20 Oct 10:32")).toBe(stampTime("not a time"));
  });
});
