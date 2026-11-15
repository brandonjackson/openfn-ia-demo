import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { IANode } from "../../model/ia-tree";
import type { StatusPageData, SystemStatus, WorkflowStatus } from "../../model/status";
import { renderPage } from "../../test/renderPage";
import StatusPage from "./StatusPage";

const node: IANode = { id: "status", label: "Status", description: "What's running right now." };

const system = (over: Partial<SystemStatus>): SystemStatus => ({
  id: "dhis2",
  name: "DHIS2",
  status: "operational",
  note: "Responding normally.",
  linkTo: "/connected-systems/dhis2",
  ...over,
});

const workflow = (over: Partial<WorkflowStatus>): WorkflowStatus => ({
  id: "w1",
  name: "Sync cases",
  project: "Project A",
  projectId: "p1",
  status: "operational",
  lastRun: "Within the last hour",
  note: "Last run succeeded.",
  ...over,
});

const draw = (data: Partial<StatusPageData>) =>
  renderPage(
    StatusPage,
    {
      node,
      ancestors: [],
      currentPath: "/status",
      data: { pageType: "status", checkedAt: "just now", systems: [system({})], workflows: [workflow({})], ...data },
    },
    [],
  );

describe("StatusPage", () => {
  it("says everything is operational when it is", () => {
    draw({});
    expect(screen.getByText("Everything is operational")).toBeTruthy();
    expect(screen.getByText("All systems and workflows are running normally.")).toBeTruthy();
    expect(screen.getByText("What's running right now. Checked just now.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Systems" })).toBeTruthy();
  });

  it("names each issue and sorts the worst to the top", () => {
    draw({
      systems: [system({}), system({ id: "kobo", name: "KoBoToolbox", status: "degraded", note: "Slow." })],
      workflows: [workflow({}), workflow({ id: "w2", name: "Dedupe clients", status: "down", note: "Failing." })],
    });
    expect(screen.getByText("2 issues need attention")).toBeTruthy();
    expect(screen.getByText("Dedupe clients is down; KoBoToolbox is degraded.")).toBeTruthy();
    expect(screen.getByText("1 system of 2 operational.")).toBeTruthy();
    expect(screen.getByText("1 workflow of 2 operational.")).toBeTruthy();
    const [systems, workflows] = screen.getAllByRole("table");
    expect(within(within(systems).getAllByRole("row")[1]).getByText("KoBoToolbox")).toBeTruthy();
    expect(within(within(workflows).getAllByRole("row")[1]).getByText("Dedupe clients")).toBeTruthy();
  });

  it("leaves the systems out without connected systems", () => {
    draw({ systems: undefined });
    expect(screen.queryByRole("heading", { name: "Systems" })).toBeNull();
    expect(screen.getByText("All workflows are running normally.")).toBeTruthy();
  });
});
