import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AnnouncementsProvider } from "../../app/announcements";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, listAll } from "../../api/client";
import { setFlag } from "../../app/feature-flags";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { projectIdFor } from "../../fake-api/projects";
import { iaTree } from "../../model/ia-tree";
import HistoryPageQuery from "./HistoryPage.query";

const wait = { timeout: 3000 };
const projectId = projectIdFor("project-a");
const projectPath = `/projects/${projectId}/history`;

function Opened() {
  const { pathname, search } = useLocation();
  return <p>Opened {pathname + search}</p>;
}

function renderAt(url: string) {
  const path = url.split("?")[0]!;
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <AnnouncementsProvider>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path="/projects/:project/history" element={<HistoryPageQuery route={{ ...route, params: { project: projectId } }} />} />
            <Route path="/history" element={<HistoryPageQuery route={route} />} />
            <Route path="/workflow-editor/:id" element={<Opened />} />
          </Routes>
        </MemoryRouter>
      </AnnouncementsProvider>
    </ApiProvider>,
  );
}

type ApiWorkOrder = { id: string; attributes: { state: string; workflow_id: string; runs: unknown[] } };

/** Every work order the server has at `path`, across its pages. */
const serverOrders = (path = `/api/projects/${projectId}/work_orders?include=runs`) => listAll<ApiWorkOrder>(path);

type ApiChannelRequest = { id: string; attributes: { status: number } };

/** Every request the project's channels carried, as the server has them. */
const serverRequests = () => listAll<ApiChannelRequest>(`/api/projects/${projectId}/channel_requests`);

/** A work order's row, which opens it, by its id. */
const row = (id: string) => screen.findByRole("row", { name: new RegExp(`^Work order ${id},`) }, wait);

/** The rows showing of one kind. */
const rowsOf = (kind: "Work order" | "Channel request") => screen.queryAllByRole("row", { name: new RegExp(`^${kind} `) });

// Rendering a project's whole history (and the editor, for "opens a run") takes several seconds in jsdom, near the default 5s under a full run.
describe("HistoryPageQuery", { timeout: 15000 }, () => {
  beforeEach(() => {
    localStorage.removeItem("openfn-demo:history-columns");
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    setFlag("organizations", true);
  });
  afterEach(() => setFlag("organizations", true));

  it("lists the project's work orders and channel requests from the server, together", async () => {
    const [orders, requests] = await Promise.all([serverOrders(), serverRequests()]);
    renderAt(projectPath);
    await row(orders[0]!.id);
    const shown = rowsOf("Work order").map((r) => r.getAttribute("aria-label") ?? "");
    expect(shown).toHaveLength(orders.length);
    for (const o of orders) expect(shown.some((name) => name.startsWith(`Work order ${o.id},`))).toBe(true);
    expect(rowsOf("Channel request")).toHaveLength(requests.length);
  });

  it("reads its filters from the URL", async () => {
    const [orders, requests] = await Promise.all([serverOrders(), serverRequests()]);
    const failed = orders.filter((o) => o.attributes.state === "failed");
    renderAt(`${projectPath}?status=failed`);
    await row(failed[0]!.id);
    expect(rowsOf("Work order")).toHaveLength(failed.length);
    expect(rowsOf("Channel request")).toHaveLength(requests.filter((r) => r.attributes.status >= 400).length);
  });

  it("shows only channel logs for ?type=channel", async () => {
    const requests = await serverRequests();
    expect(requests.length).toBeGreaterThan(0);
    renderAt(`${projectPath}?type=channel`);
    await waitFor(() => expect(rowsOf("Channel request")).toHaveLength(requests.length), wait);
    expect(rowsOf("Work order")).toHaveLength(0);
  });

  it("retries a work order on the server, which adds a run to it", async () => {
    const [finished] = (await serverOrders()).filter((o) => !["pending", "running"].includes(o.attributes.state));
    renderAt(projectPath);
    fireEvent.click(await row(finished!.id));
    fireEvent.click(screen.getByRole("button", { name: `Retry work order ${finished!.id}` }));
    expect(await screen.findByText("1 new run enqueued.", {}, wait)).toBeTruthy();
    const after = (await serverOrders()).find((o) => o.id === finished!.id)!;
    expect(after.attributes.runs).toHaveLength(finished!.attributes.runs.length + 1);
  });

  it("says why when the server refuses a retry", async () => {
    const [finished] = (await serverOrders()).filter((o) => !["pending", "running"].includes(o.attributes.state));
    renderAt(projectPath);
    fireEvent.click(await row(finished!.id));
    failNext("POST /api/projects/:project_id/work_orders/retries", {
      status: 403,
      code: "forbidden",
      detail: "You can't run workflows in this project.",
    });
    fireEvent.click(screen.getByRole("button", { name: `Retry work order ${finished!.id}` }));
    await waitFor(() => expect(within(screen.getByRole("alert")).getByText("You can't run workflows in this project.")).toBeTruthy(), wait);
    expect(within(screen.getByRole("alert")).getByText("1 work order not retried")).toBeTruthy();
  });

  it("opens a run in the editor", async () => {
    const [first] = await serverOrders();
    renderAt(projectPath);
    fireEvent.click(await row(first!.id));
    fireEvent.click((await screen.findAllByRole("button", { name: /Inspect/ }, wait))[0]!);
    expect(screen.getByText(new RegExp(`^Opened /workflow-editor/${first!.attributes.workflow_id}\\?run=`))).toBeTruthy();
  });

  it("shows every project's work orders across projects, with no Export", async () => {
    const all = await serverOrders("/api/work_orders?include=runs");
    renderAt("/history");
    await waitFor(() => expect(rowsOf("Work order")).toHaveLength(all.length), wait);
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull();
  });

  it("remembers the columns you add", async () => {
    const [first] = await serverOrders();
    renderAt(projectPath);
    await row(first!.id);
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Endpoint" }));
    expect(screen.getByRole("columnheader", { name: "Endpoint" })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("openfn-demo:history-columns") ?? "[]")).toEqual(["endpoint"]);
  });

  it("shows the server's message in the page's place when the work orders fail to load", async () => {
    failNext("GET /api/projects/:project_id/work_orders", { status: 500, code: "internal", detail: "Something went wrong in Lightning." });
    renderAt(projectPath);
    expect(await screen.findByText("Something went wrong in Lightning.", {}, wait)).toBeTruthy();
  });
});
