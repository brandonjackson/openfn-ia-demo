import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken } from "../../api/client";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { projectIdFor } from "../../fake-api/projects";
import { iaTree } from "../../model/ia-tree";
import ProjectCreatePageQuery from "./ProjectCreatePage.query";

const wait = { timeout: 3000 };

/** Where Build went, and what it carried. */
function Editor() {
  const { pathname, search, state } = useLocation();
  return (
    <p>
      Editor {pathname}
      {search} with {(state as { prompt?: string } | null)?.prompt}
    </p>
  );
}

function draw(path: string, state?: { draft?: string }) {
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[{ pathname: path, state }]}>
        <Routes>
          <Route path="/workflow-editor/*" element={<Editor />} />
          <Route path="*" element={<ProjectCreatePageQuery route={route} />} />
        </Routes>
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

  it("opens a new workflow in the project with the prompt for the assistant on Build", async () => {
    draw(projectA);
    const box = await screen.findByLabelText("What would you like to build?", {}, wait);
    fireEvent.change(box, { target: { value: " Track referrals " } });
    fireEvent.click(screen.getByRole("button", { name: "Build" }));
    expect(
      await screen.findByText(`Editor /workflow-editor/new?project=${projectIdFor("project-a")} with Track referrals`, {}, wait),
    ).toBeTruthy();
  });

  it("fills the box with a draft from adding a component, without sending it", async () => {
    draw(projectA, { draft: "A new form for" });
    const box = (await screen.findByLabelText("What would you like to build?", {}, wait)) as HTMLTextAreaElement;
    expect(box.value).toBe("A new form for");
    expect(screen.queryByText(/^Editor/)).toBeNull();
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
