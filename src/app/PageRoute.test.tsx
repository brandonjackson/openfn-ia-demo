import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../api/ApiProvider";
import { forgetCsrfToken } from "../api/client";
import { resetFakeApi, setWait } from "../fake-api";
import { projectIdFor } from "../fake-api/projects";
import { apiServiceId, apiSystemId, apiWorkflowId } from "../fixtures/ids";
import { projectWorkflowDetails, projects } from "../fixtures/projects";
import PageRoute from "./PageRoute";

const wait = { timeout: 3000 };

/** Where the router ended up. */
function Where() {
  const { pathname, search } = useLocation();
  return <p data-testid="where">{pathname + search}</p>;
}

function draw(path: string) {
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[path]}>
        <Where />
        <Routes>
          <Route path="*" element={<PageRoute />} />
        </Routes>
      </MemoryRouter>
    </ApiProvider>,
  );
}

const where = () => screen.getByTestId("where").textContent;

describe("PageRoute's old links", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
  });

  it("sends a project named by its fixture slug on to its id", () => {
    draw("/projects/project-a/deployments");
    expect(where()).toBe(`/projects/${projectIdFor("project-a")}/deployments`);
  });

  it("sends History filtered by a project's or workflow's slug on to their ids", () => {
    const workflow = projectWorkflowDetails(projects[0]!)[0]!.id;
    draw(`/history?project=project-a&workflow=${workflow}&status=failed`);
    expect(where()).toBe(`/history?project=${projectIdFor("project-a")}&workflow=${apiWorkflowId(workflow)}&status=failed`);
  });

  it("sends a project's service named by its fixture slug on to its id, from the project's slug", () => {
    const service = `/projects/${projectIdFor("project-a")}/services/${apiServiceId("project-a", "planning-application-intake")}`;
    draw("/projects/project-a/services/planning-application-intake");
    expect(where()).toBe(service);
  });

  it("sends a service named by its fixture slug on to its id when its project is already named by id", () => {
    draw(`/projects/${projectIdFor("project-a")}/services/planning-application-intake`);
    expect(where()).toBe(`/projects/${projectIdFor("project-a")}/services/${apiServiceId("project-a", "planning-application-intake")}`);
  });

  it("sends a connected system named by its fixture slug on to its id", () => {
    draw("/connected-systems/dhis2");
    expect(where()).toBe(`/connected-systems/${apiSystemId("dhis2")}`);
  });

  it("sends a page under a system named by its slug on to the system's id, where it's named after the system", async () => {
    draw("/connected-systems/dhis2/channels");
    expect(where()).toBe(`/connected-systems/${apiSystemId("dhis2")}/channels`);
    expect(await screen.findByRole("heading", { name: "DHIS2" }, wait)).toBeTruthy();
  });

  it("leaves a system id it doesn't know alone, to say Not Found where it was typed", async () => {
    draw("/connected-systems/dhis/channels");
    expect(where()).toBe("/connected-systems/dhis/channels");
    expect(await screen.findByText("Page Not Found", {}, wait)).toBeTruthy();
  });
});
