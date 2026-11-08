import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { setFlag } from "../../app/feature-flags";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import OverviewPageQuery from "./OverviewPage.query";

const wait = { timeout: 3000 };

function Opened() {
  return <p>Opened {useLocation().pathname}</p>;
}

function draw() {
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<OverviewPageQuery />} />
          <Route path="/connected-systems/:id" element={<Opened />} />
        </Routes>
      </MemoryRouter>
    </ApiProvider>,
  );
}

type ApiSystem = { id: string; attributes: { name: string } };

describe("OverviewPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
    setFlag("connectedSystems", true);
  });
  afterEach(() => setFlag("connectedSystems", true));

  it("shows the week's runs and errors, and no Status tile, since the API can't say what isn't running", async () => {
    draw();
    expect(await screen.findByText("Runs this week", {}, wait)).toBeTruthy();
    expect(screen.getByText("Errors this week")).toBeTruthy();
    expect(screen.queryByText("Status")).toBeNull();
  });

  it("shows the organisation's systems from the server", async () => {
    const { data } = await request<{ data: ApiSystem[] }>("GET", "/api/demo/connected_systems?page_size=100");
    draw();
    expect(await screen.findByText("Finish setting up your connected systems", {}, wait)).toBeTruthy();
    for (const s of data) expect(screen.getByText(s.attributes.name)).toBeTruthy();
  });

  it("adds a system on the server and opens its page", async () => {
    const before = (await request<{ data: ApiSystem[] }>("GET", "/api/demo/connected_systems?page_size=100")).data;
    draw();
    fireEvent.click(await screen.findByRole("button", { name: "Add system" }, wait));
    fireEvent.click(screen.getByRole("button", { name: /ArcGIS/ }));
    fireEvent.change(screen.getByDisplayValue("ArcGIS"), { target: { value: "County maps" } });
    fireEvent.click(screen.getByRole("button", { name: "Add connected system" }));
    const opened = await screen.findByText(/^Opened \/connected-systems\//, {}, wait);
    const after = (await request<{ data: ApiSystem[] }>("GET", "/api/demo/connected_systems?page_size=100")).data;
    const added = after.find((s) => !before.some((b) => b.id === s.id))!;
    expect(added.attributes.name).toBe("County maps");
    expect(opened.textContent).toBe(`Opened /connected-systems/${added.id}`);
  });

  it("still shows your projects when the work orders can't load, without the week's tiles", async () => {
    failNext("GET /api/projects/:project_id/work_orders", { status: 500, code: "internal", detail: "Something went wrong in Lightning." });
    draw();
    expect(await screen.findByText("Projects", {}, wait)).toBeTruthy();
    expect(screen.queryByText("Runs this week")).toBeNull();
  });

  it("shows the server's message in the page's place when your projects fail to load", async () => {
    failNext("GET /api/projects", { status: 500, code: "internal", detail: "Something went wrong in Lightning." });
    draw();
    expect(await screen.findByText("Something went wrong in Lightning.", {}, wait)).toBeTruthy();
  });
});
