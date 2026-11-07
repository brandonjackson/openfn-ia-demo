import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { setFlag } from "../../app/feature-flags";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait, signInAs } from "../../fake-api";
import { projectIdFor } from "../../fake-api/projects";
import { iaTree } from "../../model/ia-tree";
import ProjectComponentsPageQuery from "./ProjectComponentsPage.query";

const wait = { timeout: 3000 };
const projectId = projectIdFor("project-a");
const path = `/projects/${projectId}/components`;

function Opened() {
  const { pathname } = useLocation();
  return <p>Opened {pathname}</p>;
}

function renderRoute() {
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/projects/:project/components" element={<ProjectComponentsPageQuery route={route} />} />
          <Route path="/projects/:project/components/:component" element={<Opened />} />
        </Routes>
      </MemoryRouter>
    </ApiProvider>,
  );
}

type Named = { id: string; name: string };
type Many = { data: { id: string; attributes: Record<string, unknown> }[] };

const serverChannels = async () =>
  (await request<Many>("GET", `/api/projects/${projectId}/channels?page_size=100`)).data.map((c) => ({ id: c.id, name: c.attributes["name"] as string }));
const serverCollections = async () => (await request<{ data: Named[] }>("GET", `/api/projects/${projectId}/collections?page_size=100`)).data;
const serverComponents = async () => (await request<Many>("GET", `/api/demo/projects/${projectId}/components?page_size=100`)).data;

const flagsOn = () => {
  for (const flag of ["components", "forms", "artifacts", "aiSkills", "documents", "staticWebsites"] as const) setFlag(flag, true);
};

describe("ProjectComponentsPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    flagsOn();
  });
  afterEach(() => {
    flagsOn();
    signInAs(null);
  });

  it("lists the project's channels, collections and other components from the server, by kind", async () => {
    const [channels, collections, components] = await Promise.all([serverChannels(), serverCollections(), serverComponents()]);
    renderRoute();
    expect(await screen.findByText(`Channels (${channels.length})`, {}, wait)).toBeTruthy();
    expect(screen.getByText(`Collections (${collections.length})`)).toBeTruthy();
    const documents = components.filter((c) => c.attributes["component_type"] === "Document");
    expect(screen.getByText(`Documents (${documents.length})`)).toBeTruthy();
    for (const c of [...channels, ...collections]) expect(screen.getByText(c.name)).toBeTruthy();
    for (const d of documents) expect(screen.getByText(d.attributes["name"] as string)).toBeTruthy();
  });

  it("without Components, lists only the channels, as Lightning's Channels page does", async () => {
    const channels = await serverChannels();
    setFlag("components", false);
    renderRoute();
    expect(await screen.findByText(`Channels (${channels.length})`, {}, wait)).toBeTruthy();
    expect(screen.queryByText(/^Collections/)).toBeNull();
    expect(screen.queryByText(/^Documents/)).toBeNull();
    expect(screen.getByRole("button", { name: "New channel" })).toBeTruthy();
  });

  it("makes a document on the server and opens it", async () => {
    renderRoute();
    fireEvent.click(await screen.findByText("Document", {}, wait));
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Runbook" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Create document" })));
    const made = (await serverComponents()).find((c) => c.attributes["name"] === "Runbook");
    expect(made?.attributes["component_type"]).toBe("Document");
    expect(await screen.findByText(`Opened ${path}/${made!.id}`, {}, wait)).toBeTruthy();
  });

  it("makes a collection on the server and opens it", async () => {
    renderRoute();
    fireEvent.click(await screen.findByText("Collection", {}, wait));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ward codes" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Save" })));
    await waitFor(async () => expect((await serverCollections()).some((c) => c.name === "ward-codes")).toBe(true), wait);
    const made = (await serverCollections()).find((c) => c.name === "ward-codes")!;
    expect(await screen.findByText(`Opened ${path}/${made.id}`, {}, wait)).toBeTruthy();
  });

  it("offers a viewer nothing to add, with or without Components", async () => {
    const [channel] = await serverChannels();
    signInAs("user-beth");
    renderRoute();
    expect(await screen.findByText(channel!.name, {}, wait)).toBeTruthy();
    expect(screen.queryByText("Add project component")).toBeNull();

    act(() => setFlag("components", false));
    await waitFor(() => expect(screen.queryByText(/^Collections/)).toBeNull(), wait);
    expect(screen.queryByRole("button", { name: "New channel" })).toBeNull();
  });

  it("shows the server's message in the page's place when the components fail to load", async () => {
    failNext("GET /api/demo/projects/:project_id/components", { status: 500, code: "internal", detail: "Something went wrong in Lightning." });
    renderRoute();
    expect(await screen.findByText("Something went wrong in Lightning.", {}, wait)).toBeTruthy();
  });
});
