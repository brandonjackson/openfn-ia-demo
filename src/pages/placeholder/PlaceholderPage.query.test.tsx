import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken } from "../../api/client";
import { findNodeByPath } from "../../app/ia-utils";
import PageRoute from "../../app/PageRoute";
import { resetFakeApi, setWait } from "../../fake-api";
import { projectIdFor } from "../../fake-api/projects";
import { apiSystemId } from "../../fixtures/ids";
import { iaTree } from "../../model/ia-tree";
import PlaceholderPageQuery from "./PlaceholderPage.query";

const wait = { timeout: 3000 };

function draw(path: string) {
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[path]}>
        <PlaceholderPageQuery route={route} />
      </MemoryRouter>
    </ApiProvider>,
  );
}

describe("PlaceholderPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
  });

  it("draws a page that isn't built yet inside a project the API has, under its name", async () => {
    draw(`/projects/${projectIdFor("project-a")}/deployments`);
    expect(await screen.findByRole("link", { name: "project-a" }, wait)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Deployments" })).toBeTruthy();
  });

  it("says Not Found inside a project the API doesn't have", async () => {
    draw("/projects/00000000-0000-5000-8000-000000000000/deployments");
    expect(await screen.findByText("Page Not Found", {}, wait)).toBeTruthy();
  });

  it("names a page under a connected system after the system, from the API", async () => {
    draw(`/connected-systems/${apiSystemId("dhis2")}/channels`);
    expect(await screen.findByRole("heading", { name: "DHIS2" }, wait)).toBeTruthy();
  });

  it("says Not Found under a system the API doesn't have", async () => {
    draw("/connected-systems/00000000-0000-5000-8000-000000000000/channels");
    expect(await screen.findByText("Page Not Found", {}, wait)).toBeTruthy();
  });

  it("sends an old link by a system's slug on to its id", async () => {
    render(
      <ApiProvider retry={false}>
        <MemoryRouter initialEntries={["/connected-systems/dhis2/channels"]}>
          <Routes>
            <Route path="*" element={<PageRoute />} />
          </Routes>
        </MemoryRouter>
      </ApiProvider>,
    );
    expect(await screen.findByRole("heading", { name: "DHIS2" }, wait)).toBeTruthy();
  });
});
