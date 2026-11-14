import { fireEvent, screen } from "@testing-library/react";
import { FormError } from "../../model/form-error";
import { describe, expect, it } from "vitest";
import { insightsFor, weekTiles } from "../../model/insights";
import { renderPage } from "../../test/renderPage";
import type { AdaptorCatalog } from "../../model/adaptor-catalog";
import OverviewPage, { type OverviewPageData } from "./OverviewPage";

const catalog: AdaptorCatalog = {
  adaptors: [{ id: "dhis2", name: "DHIS2", description: "Health information", version: "1.0.0" }],
  categories: [{ id: "health", label: "Health", groups: [{ label: "Records", adaptors: ["dhis2"] }] }],
  builtInTools: [],
  aiModels: [],
  aiActions: [],
};

const data = (more: Partial<OverviewPageData> = {}): OverviewPageData => ({
  tiles: weekTiles(insightsFor([], "Across all projects", false)),
  connectedSystems: [],
  recommendedSystems: [],
  recommended: 3,
  projects: [],
  ...more,
});

describe("OverviewPage", () => {
  it("shows the week's runs and errors, each opening Insights", () => {
    renderPage(OverviewPage, { data: data() }, ["onAddSystem"]);
    for (const label of ["Runs this week", "Errors this week"]) expect(screen.getByText(label).closest("a")!.getAttribute("href")).toBe("/insights");
  });

  it("counts setup towards the systems connected and suggested", () => {
    renderPage(OverviewPage, { data: data() }, ["onAddSystem"]);
    expect(screen.getByText("0 of 3 recommended systems connected.")).toBeTruthy();
  });

  it("adds a system from the form, saying so while it runs, and why when the server refuses", async () => {
    const host = renderPage(OverviewPage, { data: data({ catalog }) }, ["onAddSystem"]);
    fireEvent.click(screen.getByRole("button", { name: "Add system" }));
    expect(screen.getByRole("dialog", { name: "Connect a system" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /DHIS2/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add connected system" }));
    expect(host.calls("onAddSystem")[0]![0]).toMatchObject({ name: "DHIS2", adaptor: "dhis2" });
    expect(screen.getByRole("button", { name: "Adding…" })).toBeTruthy();
    await host.reject("onAddSystem", new FormError("A system with that name already exists."));
    expect(screen.getByText("A system with that name already exists.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Add connected system" }));
    await host.resolve("onAddSystem");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("leaves setup out without connected systems", () => {
    renderPage(OverviewPage, { data: data({ connectedSystems: undefined }) }, ["onAddSystem"]);
    expect(screen.queryByText("Finish setting up your connected systems")).toBeNull();
  });
});
