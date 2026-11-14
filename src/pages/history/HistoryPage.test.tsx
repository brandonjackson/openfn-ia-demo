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

type Actions = "onFiltersChange" | "onRetry" | "onRetryFromStep" | "onCancel" | "onInspectRun" | "onOpenChannelRun" | "onExport" | "onAnswerApproval";

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
      const host = draw([waiting()], defaultHistoryFilters, ["onFiltersChange", "onInspectRun", "onAnswerApproval"]);
      // A run waiting on someone isn't finished, so it isn't offered a retry.
      expect(screen.queryByRole("button", { name: "Retry work order ccc333" })).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Work order ccc333, waiting" }));
      expect(screen.getByText("Pay Amina a grant?")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Approve" }));
      expect(host.calls("onAnswerApproval")).toEqual([["run-ccc333", "approved", ""]]);
      expect(screen.getByRole("button", { name: "Approving…" }).getAttribute("aria-disabled")).toBe("true");
      await host.resolve("onAnswerApproval");
      // Once it's through the button is back; the wrapper's toast says it carried on.
      expect(screen.getByRole("button", { name: "Approve" })).toBeTruthy();
    });

    it("asks why before rejecting, and shows a refusal on the card", async () => {
      const host = draw([waiting()], defaultHistoryFilters, ["onFiltersChange", "onInspectRun", "onAnswerApproval"]);
      fireEvent.click(screen.getByRole("button", { name: "Work order ccc333, waiting" }));
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

    it("shows a work order's outcome beside its status, and filters by it", () => {
      const refused: HistoryWorkOrder = { ...order("ddd444", "success"), workOrder: { ...order("ddd444", "success").workOrder, outcome: { status: "rejected", description: "Not eligible" } } };
      draw([refused, order("eee555", "success")], { ...defaultHistoryFilters, outcomes: ["rejected"] });
      expect(screen.getByText("1 work order of 2, newest first")).toBeTruthy();
      expect(screen.getByText("Rejected")).toBeTruthy();
    });
  });
});
