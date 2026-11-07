import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
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
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/projects/:project/history" element={<HistoryPageQuery route={{ ...route, params: { project: projectId } }} />} />
          <Route path="/history" element={<HistoryPageQuery route={route} />} />
          <Route path="/workflow-editor/:id" element={<Opened />} />
        </Routes>
      </MemoryRouter>
    </ApiProvider>,
  );
}

type ApiWorkOrder = { id: string; attributes: { state: string; workflow_id: string; runs: unknown[] } };

const serverOrders = async (path = `/api/projects/${projectId}/work_orders?include=runs&page_size=100`) =>
  (await request<{ data: ApiWorkOrder[] }>("GET", path)).data;

/** The button that opens a work order's row, by its id. */
const row = (id: string) => screen.findByRole("button", { name: new RegExp(`^Work order ${id},`) }, wait);

describe("HistoryPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    setFlag("organizations", true);
  });
  afterEach(() => setFlag("organizations", true));

  it("lists the project's work orders from the server", async () => {
    const orders = await serverOrders();
    renderAt(projectPath);
    expect(await screen.findByText(`${orders.length} work orders, newest first`, {}, wait)).toBeTruthy();
    for (const o of orders) expect(screen.getByRole("button", { name: new RegExp(`^Work order ${o.id},`) })).toBeTruthy();
  });

  it("reads its filters from the URL", async () => {
    const orders = await serverOrders();
    const failed = orders.filter((o) => o.attributes.state === "failed");
    renderAt(`${projectPath}?status=failed`);
    expect(await screen.findByText(`${failed.length} work order${failed.length === 1 ? "" : "s"} of ${orders.length}, newest first`, {}, wait)).toBeTruthy();
  });

  it("retries a work order on the server, which adds a run to it", async () => {
    const [finished] = (await serverOrders()).filter((o) => !["pending", "running"].includes(o.attributes.state));
    renderAt(projectPath);
    await row(finished!.id);
    fireEvent.click(screen.getByRole("button", { name: `Retry work order ${finished!.id}` }));
    expect(await screen.findByText("1 new run enqueued.", {}, wait)).toBeTruthy();
    const after = (await serverOrders()).find((o) => o.id === finished!.id)!;
    expect(after.attributes.runs).toHaveLength(finished!.attributes.runs.length + 1);
  });

  it("says why when the server refuses a retry", async () => {
    const [finished] = (await serverOrders()).filter((o) => !["pending", "running"].includes(o.attributes.state));
    renderAt(projectPath);
    await row(finished!.id);
    failNext("POST /api/projects/:project_id/work_orders/retries", { status: 403, code: "forbidden", detail: "You can't run workflows in this project." });
    fireEvent.click(screen.getByRole("button", { name: `Retry work order ${finished!.id}` }));
    const alert = await screen.findByRole("alert", {}, wait);
    expect(within(alert).getByText("You can't run workflows in this project.")).toBeTruthy();
  });

  it("opens a run in the editor", async () => {
    const [first] = await serverOrders();
    renderAt(projectPath);
    fireEvent.click(await row(first!.id));
    fireEvent.click((await screen.findAllByRole("button", { name: /Inspect/ }, wait))[0]!);
    expect(screen.getByText(new RegExp(`^Opened /workflow-editor/${first!.attributes.workflow_id}\\?run=`))).toBeTruthy();
  });

  it("shows every project's work orders across projects, with no Export", async () => {
    const all = await serverOrders("/api/work_orders?include=runs&page_size=100");
    renderAt("/history");
    expect(await screen.findByText(new RegExp(`^${all.length} work orders, newest first`), {}, wait)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull();
  });

  it("shows the server's message in the page's place when the work orders fail to load", async () => {
    failNext("GET /api/projects/:project_id/work_orders", { status: 500, code: "internal", detail: "Something went wrong in Lightning." });
    renderAt(projectPath);
    expect(await screen.findByText("Something went wrong in Lightning.", {}, wait)).toBeTruthy();
  });
});
