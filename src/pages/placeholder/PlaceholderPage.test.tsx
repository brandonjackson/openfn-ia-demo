import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { IANode } from "../../model/ia-tree";
import { renderPage } from "../../test/renderPage";
import PlaceholderPage from "./PlaceholderPage";

const node: IANode = {
  id: "deployments",
  label: "Deployments",
  description: "Where each workflow version runs.",
  actions: ["New deployment"],
  filters: [{ label: "Status", options: ["All", "Live", "Paused"] }],
  children: [{ id: "history", label: "Deployment history", description: "Every deployment, newest first." }],
};

const draw = (over: Partial<IANode> = {}) =>
  renderPage(PlaceholderPage, { node: { ...node, ...over }, ancestors: [], currentPath: "/projects/p1/deployments" }, []);

describe("PlaceholderPage", () => {
  it("names the page, says what it will hold, and lists the pages under it", () => {
    draw();
    expect(screen.getByRole("heading", { name: "Deployments" })).toBeTruthy();
    expect(screen.getByText("Where each workflow version runs.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "New deployment" })).toBeTruthy();
    expect(screen.getByText("Deployment history")).toBeTruthy();
  });

  it("switches a filter, starting on its first option", () => {
    draw();
    expect(screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Live" }));
    expect(screen.getByRole("button", { name: "Live" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("says what goes here when the page has no description", () => {
    draw({ description: undefined, children: undefined });
    expect(screen.getByText('Content for "Deployments" goes here.')).toBeTruthy();
    expect(screen.queryByText("Sub-pages")).toBeNull();
  });
});
