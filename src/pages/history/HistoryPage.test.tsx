import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormError } from "../../model/form-error";
import { defaultHistoryFilters, type ChannelRequest, type HistoryColumnId, type HistoryFilters, type HistoryWorkOrder } from "../../model/history";
import type { RunDetails, RunStatus } from "../../model/workflow";
import { renderPage } from "../../test/renderPage";
import HistoryPage, { type HistoryPageData, type HistoryPageProps } from "./HistoryPage";

const run = (workOrderId: string, status: RunStatus, started = "20/10/2026, 09:00:00"): RunDetails => ({
  workOrderId,
  runId: `run-${workOrderId}`,
  status,
  duration: "1.2s",
  started,
  when: "today",
  startedBy: "Webhook",
  version: "v1",
  inputId: `clip-${workOrderId}`,
  steps: [],
  logs: [],
});

const order = (id: string, status: RunStatus, receivedAt = "20/10/2026, 09:00:00"): HistoryWorkOrder => ({
  workOrder: { id, status, lastActivity: "today", runs: [run(id, status, receivedAt)] },
  workflowId: "intake",
  workflowName: "Intake",
  projectId: "p",
  projectName: "Project A",
  input: { id: `clip-${id}`, type: "http_request", body: '{"name":"Amina"}', created: receivedAt },
  receivedAt,
});

const request = (id: string, status: number, at = "20 Oct, 09:30"): ChannelRequest => ({
  id,
  channelId: "sms",
  channelName: "SMS intake",
  channelType: "event",
  system: "Twilio",
  method: "POST",
  endpoint: "https://example.org/i/sms",
  status,
  durationMs: 96,
  at,
  summary: `Message ${id}`,
  projectId: "p",
  projectName: "Project A",
});

const data = (workOrders: HistoryWorkOrder[], more: Partial<HistoryPageData> = {}): HistoryPageData => ({
  workOrders,
  channelRequests: [],
  workflows: [{ id: "intake", name: "Intake", projectId: "p", steps: [{ id: "fetch", label: "Fetch" }], latestVersion: "v1" }],
  ...more,
});

type Actions = "onFiltersChange" | "onColumnsChange" | "onRetry" | "onRetryFromStep" | "onCancel" | "onInspectRun" | "onOpenChannelRun" | "onExport" | "onAnswerApproval";

const draw = (
  workOrders: HistoryWorkOrder[],
  filters: HistoryFilters = defaultHistoryFilters,
  actions: Actions[] = ["onFiltersChange", "onColumnsChange", "onRetry", "onRetryFromStep", "onCancel", "onInspectRun", "onExport"],
  more: Partial<HistoryPageData> = {},
  columns: HistoryColumnId[] = [],
) => {
  const frame: Omit<HistoryPageProps, Actions> = {
    node: { id: "history", label: "History", description: "Work orders and channel requests." },
    ancestors: [],
    currentPath: "/projects/p/history",
    data: data(workOrders, more),
    filters,
    columns,
  };
  return renderPage(HistoryPage, frame, actions);
};

describe("HistoryPage", () => {
  it("lists work orders and channel requests together, the most recently active first, and says when there are none", () => {
    draw([order("aaa111", "success", "20/10/2026, 09:00:00"), order("bbb222", "failed", "20/10/2026, 09:45:00")], defaultHistoryFilters, undefined, {
      channelRequests: [request("req-1", 502, "20 Oct, 09:30")],
    });
    const rows = screen.getAllByRole("row", { name: /^(Work order|Channel request) / }).map((r) => r.getAttribute("aria-label"));
    expect(rows).toEqual(["Work order bbb222, failed", "Channel request req-1, failed", "Work order aaa111, success"]);
    // The request's HTTP code sits beside its pill.
    expect(screen.getByText("502")).toBeTruthy();

    draw([]);
    expect(screen.getByText("No history yet")).toBeTruthy();
  });

  it("shows only what the filters let through, channel requests by their status too", () => {
    draw([order("aaa111", "success"), order("bbb222", "failed")], { ...defaultHistoryFilters, statuses: ["failed"] }, undefined, {
      channelRequests: [request("req-1", 200), request("req-2", 500)],
    });
    const rows = screen.getAllByRole("row", { name: /^(Work order|Channel request) / }).map((r) => r.getAttribute("aria-label"));
    expect(rows.sort()).toEqual(["Channel request req-2, failed", "Work order bbb222, failed"]);
  });

  it("leaves channel requests out for a filter only work orders have", () => {
    draw([order("aaa111", "success")], { ...defaultHistoryFilters, kind: "workflow" }, undefined, { channelRequests: [request("req-1", 200)] });
    expect(screen.queryByRole("row", { name: /^Channel request/ })).toBeNull();
    expect(screen.getByRole("row", { name: "Work order aaa111, success" })).toBeTruthy();
  });

  it("opens a channel request to what it carried, and the run it started", () => {
    const host = draw([], defaultHistoryFilters, ["onFiltersChange", "onColumnsChange", "onOpenChannelRun"], {
      channelRequests: [{ ...request("req-1", 202), runId: "run-1", workflowId: "intake" }],
    });
    fireEvent.click(screen.getByRole("row", { name: "Channel request req-1, success" }));
    expect(screen.getByText("Message req-1")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Open run" }));
    expect(host.calls("onOpenChannelRun")[0]![0].id).toBe("req-1");
  });

  it("adds columns from Columns, offering only what applies here", () => {
    const host = draw([order("aaa111", "success")], defaultHistoryFilters, undefined, { channelRequests: [request("req-1", 200)] }, ["system"]);
    expect(screen.getByRole("columnheader", { name: "System" })).toBeTruthy();
    expect(screen.getByText("Twilio")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Columns (1)" }));
    // One project's History has no Project column, and no tools means no Outcome.
    expect(screen.queryByRole("checkbox", { name: "Project" })).toBeNull();
    expect(screen.queryByRole("checkbox", { name: "Outcome" })).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "Received" }));
    expect(host.calls("onColumnsChange")).toEqual([[["system", "received"]]]);
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

  it("cancels a work order still waiting to run, from the work order opened", async () => {
    const host = draw([order("ccc333", "pending")]);
    fireEvent.click(screen.getByRole("row", { name: "Work order ccc333, pending" }));
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

  it("filters to channel logs through the Type filter", () => {
    const host = draw([order("aaa111", "success")]);
    fireEvent.click(screen.getByRole("button", { name: "Type is any" }));
    fireEvent.click(screen.getByRole("option", { name: "Channel logs" }));
    expect(host.calls("onFiltersChange")[0]![0].kind).toBe("channel");
  });

  describe("with tools", () => {
    /** A work order whose run waits on a Human in the loop step that needs a comment to reject. */
    const waiting = (): HistoryWorkOrder => {
      const o = order("ccc333", "waiting");
      const r: RunDetails = {
        ...o.workOrder.runs[0]!,
        steps: [{ id: "s1", jobId: "approve", label: "Officer approves", status: "waiting", duration: "" }],
        waitingFor: {
          stepId: "s1",
          jobId: "approve",
          assignee: "District officer",
          title: "Pay Amina a grant?",
          message: "Check she hasn't had one this year.",
          fields: [{ label: "Applicant", value: "Amina" }],
          comment: "required_on_reject",
          asked: "today",
          expires: "2 days after it was asked",
          onTimeout: "reject",
        },
      };
      return { ...o, workOrder: { ...o.workOrder, runs: [r] } };
    };

    it("approves a waiting run from its work order, saying so while it's sent", async () => {
      const host = draw([waiting()], defaultHistoryFilters, ["onFiltersChange", "onColumnsChange", "onInspectRun", "onAnswerApproval"]);
      fireEvent.click(screen.getByRole("row", { name: "Work order ccc333, waiting" }));
      // A run waiting on someone isn't finished, so it isn't offered a retry.
      expect(screen.queryByRole("button", { name: "Retry work order ccc333" })).toBeNull();
      expect(screen.getByText("Pay Amina a grant?")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Approve" }));
      expect(host.calls("onAnswerApproval")).toEqual([["run-ccc333", "approved", ""]]);
      expect(screen.getByRole("button", { name: "Approving…" }).getAttribute("aria-disabled")).toBe("true");
      await host.resolve("onAnswerApproval");
      // Once it's through the button is back; the wrapper's toast says it carried on.
      expect(screen.getByRole("button", { name: "Approve" })).toBeTruthy();
    });

    it("asks why before rejecting, and shows a refusal on the card", async () => {
      const host = draw([waiting()], defaultHistoryFilters, ["onFiltersChange", "onColumnsChange", "onInspectRun", "onAnswerApproval"]);
      fireEvent.click(screen.getByRole("row", { name: "Work order ccc333, waiting" }));
      fireEvent.click(screen.getByRole("button", { name: "Reject" }));
      expect(host.calls("onAnswerApproval")).toEqual([]);
      expect(screen.getByText("Say why it's rejected")).toBeTruthy();
      expect(document.activeElement).toBe(screen.getByRole("textbox", { name: /Comment/ }));
      fireEvent.change(screen.getByRole("textbox", { name: /Comment/ }), { target: { value: "Had one in March" } });
      fireEvent.click(screen.getByRole("button", { name: "Reject" }));
      expect(host.calls("onAnswerApproval")).toEqual([["run-ccc333", "rejected", "Had one in March"]]);
      await host.reject("onAnswerApproval", new FormError("This run isn't waiting for an answer."));
      expect(screen.getByRole("alert").textContent).toBe("This run isn't waiting for an answer.");
    });

    it("shows a work order's outcome in its column, and filters by it", () => {
      const refused: HistoryWorkOrder = { ...order("ddd444", "success"), workOrder: { ...order("ddd444", "success").workOrder, outcome: { status: "refused", description: "Not eligible" } } };
      const frame = { node: { id: "history", label: "History" }, ancestors: [], currentPath: "/projects/p/history", data: data([refused, order("eee555", "success")]), columns: ["outcome" as const], showOutcomes: true };
      renderPage(HistoryPage, { ...frame, filters: { ...defaultHistoryFilters, outcomes: ["refused"] } }, ["onFiltersChange", "onColumnsChange", "onInspectRun"]);
      expect(screen.getAllByRole("row", { name: /^Work order / })).toHaveLength(1);
      expect(within(screen.getByRole("row", { name: "Work order ddd444, success" })).getByText("Refused")).toBeTruthy();
    });
  });
});
