import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormError } from "../../model/form-error";
import { defaultHistoryFilters, type HistoryFilters, type HistoryWorkOrder } from "../../model/history";
import type { RunDetails, RunStatus } from "../../model/workflow";
import { renderPage } from "../../test/renderPage";
import HistoryPage, { type HistoryPageData, type HistoryPageProps } from "./HistoryPage";

const run = (workOrderId: string, status: RunStatus): RunDetails => ({
  workOrderId,
  runId: `run-${workOrderId}`,
  status,
  duration: "1.2s",
  started: "20/10/2026, 09:00:00",
  when: "today",
  startedBy: "Webhook",
  version: "v1",
  inputId: `clip-${workOrderId}`,
  steps: [],
  logs: [],
});

const order = (id: string, status: RunStatus, receivedAt = "20/10/2026, 09:00:00"): HistoryWorkOrder => ({
  workOrder: { id, status, lastActivity: "today", runs: [run(id, status)] },
  workflowId: "intake",
  workflowName: "Intake",
  projectId: "p",
  projectName: "Project A",
  input: { id: `clip-${id}`, type: "http_request", body: '{"name":"Amina"}', created: receivedAt },
  receivedAt,
});

const data = (workOrders: HistoryWorkOrder[], more: Partial<HistoryPageData> = {}): HistoryPageData => ({
  workOrders,
  channelRequests: [],
  workflows: [{ id: "intake", name: "Intake", projectId: "p", steps: [{ id: "fetch", label: "Fetch" }], latestVersion: "v1" }],
  ...more,
});

type Actions = "onFiltersChange" | "onRetry" | "onRetryFromStep" | "onCancel" | "onInspectRun" | "onOpenChannelRun" | "onExport";

const draw = (workOrders: HistoryWorkOrder[], filters: HistoryFilters = defaultHistoryFilters, actions: Actions[] = ["onFiltersChange", "onRetry", "onRetryFromStep", "onCancel", "onInspectRun", "onExport"], more: Partial<HistoryPageData> = {}) => {
  const frame: Omit<HistoryPageProps, Actions> = {
    node: { id: "history", label: "History", description: "Work orders and channel requests." },
    ancestors: [],
    currentPath: "/projects/p/history",
    data: data(workOrders, more),
    filters,
  };
  return renderPage(HistoryPage, frame, actions);
};

describe("HistoryPage", () => {
  it("lists the work orders it's given, newest first, and says when there are none", () => {
    draw([order("aaa111", "success"), order("bbb222", "failed")]);
    expect(screen.getByText("2 work orders, newest first")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Work order aaa111, success" })).toBeTruthy();

    draw([]);
    expect(screen.getByText("No work orders yet")).toBeTruthy();
  });

  it("shows only the work orders the filters let through", () => {
    draw([order("aaa111", "success"), order("bbb222", "failed")], { ...defaultHistoryFilters, statuses: ["failed"] });
    expect(screen.getByText("1 work order of 2, newest first")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Work order aaa111, success" })).toBeNull();
  });

  it("retries the picked work orders, then clears the picks", async () => {
    const host = draw([order("aaa111", "failed"), order("bbb222", "success")]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select every work order shown" }));
    fireEvent.click(within(screen.getByRole("toolbar", { name: "Actions for 2 selected" })).getByRole("button", { name: "Retry" }));
    expect(host.calls("onRetry")).toEqual([[["aaa111", "bbb222"]]]);
    await host.resolve("onRetry");
    expect(screen.queryByRole("toolbar", { name: "Actions for 2 selected" })).toBeNull();
  });

  it("keeps the picks to try again when the server refuses a retry (the wrapper says why)", async () => {
    const host = draw([order("aaa111", "failed"), order("bbb222", "success")]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select every work order shown" }));
    fireEvent.click(within(screen.getByRole("toolbar", { name: "Actions for 2 selected" })).getByRole("button", { name: "Retry" }));
    expect(host.calls("onRetry")).toEqual([[["aaa111", "bbb222"]]]);
    await host.reject("onRetry", new FormError("This workflow has been deleted."));
    expect(screen.getByRole("toolbar", { name: "Actions for 2 selected" })).toBeTruthy();
  });

  it("cancels a work order still waiting to run", async () => {
    const host = draw([order("ccc333", "pending")]);
    fireEvent.click(screen.getByRole("button", { name: "Cancel work order ccc333" }));
    expect(host.calls("onCancel")).toEqual([[["ccc333"]]]);
    await host.reject("onCancel", new FormError("Only runs nobody has picked up can be cancelled."));
    expect(screen.getByRole("button", { name: "Cancel work order ccc333" })).toBeTruthy();
  });

  it("leaves Export out where it isn't given, as History across projects does", () => {
    draw([order("aaa111", "success")], defaultHistoryFilters, ["onFiltersChange", "onRetry", "onInspectRun"], { projects: [{ id: "p", name: "Project A" }] });
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull();
  });

  it("starts an export of what's shown once confirmed", async () => {
    const host = draw([order("aaa111", "success")]);
    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    fireEvent.click(screen.getByRole("button", { name: "Start export" }));
    expect(host.calls("onExport")).toEqual([[["aaa111"]]]);
    await host.resolve("onExport");
    expect(screen.queryByRole("button", { name: "Start export" })).toBeNull();
  });

  it("switches to channel requests through the filters", () => {
    const host = draw([order("aaa111", "success")]);
    fireEvent.click(screen.getByRole("button", { name: /Channel requests/ }));
    expect(host.calls("onFiltersChange")[0]![0].tab).toBe("channels");
  });
});
