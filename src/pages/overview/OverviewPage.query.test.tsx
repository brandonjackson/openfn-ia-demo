import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { setFlag } from "../../app/feature-flags";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import OverviewPageQuery from "./OverviewPage.query";

const wait = { timeout: 3000 };

function draw() {
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={["/"]}>
        <OverviewPageQuery />
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

  it("shows the server's message in the page's place when the work orders fail to load", async () => {
    failNext("GET /api/projects/:project_id/work_orders", { status: 500, code: "internal", detail: "Something went wrong in Lightning." });
    draw();
    expect(await screen.findByText("Something went wrong in Lightning.", {}, wait)).toBeTruthy();
  });
});
