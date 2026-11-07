import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useParams } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { setFlag } from "../../app/feature-flags";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait, signInAs } from "../../fake-api";
import { projectIdFor } from "../../fake-api/projects";
import { iaTree } from "../../model/ia-tree";
import ComponentPageQuery from "./ComponentPage.query";

const wait = { timeout: 3000 };
const projectId = projectIdFor("project-a");
const listPath = `/projects/${projectId}/components`;

function Opened() {
  const { pathname } = useLocation();
  return <p>Opened {pathname}</p>;
}

/** The component page, fed its route as PageRoute does. */
function Component() {
  const { component } = useParams();
  const path = `${listPath}/${component}`;
  return <ComponentPageQuery route={{ ...findNodeByPath(iaTree, path)!, currentPath: path }} />;
}

function renderRoute(componentId: string) {
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[`${listPath}/${componentId}`]}>
        <Routes>
          <Route path="/projects/:project/components/:component" element={<Component />} />
          <Route path="/projects/:project/components" element={<Opened />} />
          <Route path="/workflow-editor/:id" element={<Opened />} />
        </Routes>
      </MemoryRouter>
    </ApiProvider>,
  );
}

type Resource = { id: string; attributes: Record<string, unknown> };

const serverComponents = async () => (await request<{ data: Resource[] }>("GET", `/api/demo/projects/${projectId}/components?page_size=100`)).data;
const serverChannels = async () => (await request<{ data: Resource[] }>("GET", `/api/projects/${projectId}/channels?page_size=100`)).data;
const serverChannel = async (id: string) => (await request<{ data: Resource }>("GET", `/api/projects/${projectId}/channels/${id}`)).data;

const pick = async (name: string, item: string) => {
  fireEvent.click(await screen.findByRole("button", { name: `Actions for ${name}` }, wait));
  fireEvent.click(screen.getByRole("menuitem", { name: item }));
};

describe("ComponentPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    for (const flag of ["components", "documents"] as const) setFlag(flag, true);
  });
  afterEach(() => {
    signInAs(null);
    for (const flag of ["components", "documents"] as const) setFlag(flag, true);
  });

  it("opens a document from the server, and deletes it there, back to the list", async () => {
    const document = (await serverComponents()).find((c) => c.attributes["component_type"] === "Document")!;
    const name = document.attributes["name"] as string;
    renderRoute(document.id);
    expect(await screen.findByRole("heading", { name }, wait)).toBeTruthy();
    await pick(name, "Delete");
    fireEvent.click(screen.getByRole("button", { name: "Delete document" }));
    expect(await screen.findByText(`Opened ${listPath}`, {}, wait)).toBeTruthy();
    expect((await serverComponents()).some((c) => c.id === document.id)).toBe(false);
  });

  it("says a document isn't there with Documents off", async () => {
    const document = (await serverComponents()).find((c) => c.attributes["component_type"] === "Document")!;
    setFlag("documents", false);
    renderRoute(document.id);
    expect(await screen.findByText("This feature is turned off", {}, wait)).toBeTruthy();
  });

  it("turns a channel off on the server", async () => {
    const channel = (await serverChannels()).find((c) => c.attributes["enabled"] !== false)!;
    const name = channel.attributes["name"] as string;
    renderRoute(channel.id);
    await pick(name, "Turn off");
    expect(await screen.findByText("This channel is off", {}, wait)).toBeTruthy();
    expect((await serverChannel(channel.id)).attributes["enabled"]).toBe(false);
  });

  it("says why when the server refuses to turn a channel off", async () => {
    const channel = (await serverChannels()).find((c) => c.attributes["enabled"] !== false)!;
    failNext("PUT /api/projects/:project_id/channels/:id", { status: 409, code: "concurrent_edit", detail: "Someone else changed this channel." });
    renderRoute(channel.id);
    await pick(channel.attributes["name"] as string, "Turn off");
    expect((await screen.findByRole("alert", {}, wait)).textContent).toContain("Someone else changed this channel.");
    expect((await serverChannel(channel.id)).attributes["enabled"]).not.toBe(false);
  });

  it("offers a viewer no way to change a channel", async () => {
    const [channel] = await serverChannels();
    signInAs("user-beth");
    renderRoute(channel!.id);
    expect(await screen.findByRole("heading", { name: channel!.attributes["name"] as string }, wait)).toBeTruthy();
    expect(screen.queryByRole("button", { name: `Actions for ${channel!.attributes["name"]}` })).toBeNull();
  });

  it("opens a workflow in the editor", async () => {
    const { workflows } = await request<{ workflows: { id: string }[] }>("GET", `/api/projects/${projectId}/workflows`);
    renderRoute(workflows[0]!.id);
    expect(await screen.findByText(`Opened /workflow-editor/${workflows[0]!.id}`, {}, wait)).toBeTruthy();
  });

  it("says when there's no such component", async () => {
    renderRoute(crypto.randomUUID());
    await waitFor(() => expect(screen.getByText(/No data found for/)).toBeTruthy(), wait);
  });

  it("shows the server's message in the page's place when the components fail to load", async () => {
    failNext("GET /api/demo/projects/:project_id/components", { status: 500, code: "internal", detail: "Something went wrong in Lightning." });
    renderRoute(crypto.randomUUID());
    expect(await screen.findByText("Something went wrong in Lightning.", {}, wait)).toBeTruthy();
  });
});
