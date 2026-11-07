import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { insightsFor } from "../../model/insights";
import { renderPage } from "../../test/renderPage";
import InsightsPage, { type InsightsPageProps } from "./InsightsPage";

const frame: Omit<InsightsPageProps, "data"> = {
  node: { id: "insights", label: "Insights", description: "Trends over time." },
  ancestors: [],
  currentPath: "/insights",
};

describe("InsightsPage", () => {
  it("shows the week's numbers it's given", () => {
    renderPage(InsightsPage, { ...frame, data: insightsFor([], "Across all projects", true) }, []);
    expect(screen.getByText("Last 7 days", { selector: "span" })).toBeTruthy();
    expect(screen.getByText("Average run time")).toBeTruthy();
    expect(screen.getByText("Runs per day")).toBeTruthy();
  });

  it("lists each project across projects, with no rate for one that didn't run", () => {
    renderPage(InsightsPage, { ...frame, data: insightsFor([{ id: "p", name: "Quiet project", workOrders: [] }], "Across all projects", true) }, []);
    expect(screen.getByText("By project")).toBeTruthy();
    const row = screen.getByText("Quiet project").closest("tr")!;
    expect(row.textContent).not.toContain("%");
  });

  it("leaves the table out inside a project", () => {
    renderPage(InsightsPage, { ...frame, data: insightsFor([{ id: "p", name: "Quiet project", workOrders: [] }], "This project", false) }, []);
    expect(screen.queryByText("By project")).toBeNull();
  });
});
