import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../api/ApiProvider";
import { forgetCsrfToken } from "../api/client";
import { resetFakeApi, setWait } from "../fake-api";
import { projectIdFor } from "../fake-api/projects";
import { apiSystemId } from "../fixtures/ids";
import PageRoute from "./PageRoute";

const wait = { timeout: 3000 };

/** Where the router ended up. */
function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>;
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
