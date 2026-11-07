import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken } from "../../api/client";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { projectIdFor } from "../../fake-api/projects";
import { iaTree } from "../../model/ia-tree";
import ProjectCreatePageQuery from "./ProjectCreatePage.query";

const wait = { timeout: 3000 };

function draw(path: string, state?: { prompt?: string; draft?: string }) {
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[{ pathname: path, state }]}>
        <ProjectCreatePageQuery route={route} />
      </MemoryRouter>
    </ApiProvider>,
  );
}

const projectA = `/projects/${projectIdFor("project-a")}/create`;

describe("ProjectCreatePageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
  });

  it("offers the starter ideas from the server, inside the project under its name", async () => {
    draw(projectA);
    expect(await screen.findByText("Enrol newborns in child benefits", {}, wait)).toBeTruthy();
    expect(screen.getByRole("link", { name: "project-a" })).toBeTruthy();
  });

  it("passes on a prompt started on the Overview", async () => {
    draw(projectA, { prompt: "Track referrals" });
    expect(await screen.findByText("Drafting your service", {}, wait)).toBeTruthy();
  });

  it("says the page couldn't load when the ideas can't be", async () => {
    failNext("GET /api/demo/build_ideas", { status: 500, code: "internal", detail: "Something went wrong." });
    draw(projectA);
    expect(await screen.findByText("Something went wrong.", {}, wait)).toBeTruthy();
  });

  it("says Not Found inside a project the API doesn't have", async () => {
    draw("/projects/00000000-0000-5000-8000-000000000000/create");
    expect(await screen.findByText("Page Not Found", {}, wait)).toBeTruthy();
  });
});
