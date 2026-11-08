import { describe, expect, it } from "vitest";
import { insightsFor } from "../model/insights";
import { toRecord, type ApiWorkOrder } from "./work-orders";

/** A work order as Lightning sends it today: its state and times, with no runs or workflow. */
const lightningOrder = {
  id: "7d1c6f3e-2b4a-4c1e-9a55-0f3c2d8e1b77",
  attributes: { state: "failed", last_activity: "2026-11-08T09:00:00Z", dataclip_id: "d1", input: null, inserted_at: "2026-11-08T08:59:00Z" },
} as unknown as ApiWorkOrder;

describe("a work order read in from the API", () => {
  it("has no runs when the API sends none, so the week adds up to nothing instead of failing", () => {
    const record = toRecord(lightningOrder, "p1");
    expect(record.workOrder.runs).toEqual([]);
    const week = insightsFor([{ id: "p1", name: "Project", workOrders: [record.workOrder] }], "Across all projects", true);
    expect(week.tiles[0]).toMatchObject({ label: "Runs", value: "0" });
  });
});
