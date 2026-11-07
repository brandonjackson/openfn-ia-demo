import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { insightsFor, weekTiles } from "../../model/insights";
import { renderPage } from "../../test/renderPage";
import OverviewPage, { type OverviewPageData } from "./OverviewPage";

const data = (more: Partial<OverviewPageData> = {}): OverviewPageData => ({
  tiles: weekTiles(insightsFor([], "Across all projects", false)),
  connectedSystems: [],
  recommendedSystems: [],
  recommended: 3,
  projects: [],
  adaptors: [],
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

  it("leaves setup out without connected systems", () => {
    renderPage(OverviewPage, { data: data({ connectedSystems: undefined }) }, ["onAddSystem"]);
    expect(screen.queryByText("Finish setting up your connected systems")).toBeNull();
  });
});
