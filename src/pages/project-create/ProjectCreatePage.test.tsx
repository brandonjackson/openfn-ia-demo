import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BuildIdea } from "../../model/build-ideas";
import { renderPage } from "../../test/renderPage";
import ProjectCreatePage, { type ProjectCreatePageProps } from "./ProjectCreatePage";

const idea: BuildIdea = {
  id: "i1",
  title: "Enrol newborns in child benefits",
  description: "Open a benefit application when a birth is registered.",
  systems: ["OpenCRVS", "Salesforce"],
  prompt: "When a birth is registered in OpenCRVS, open an application in Salesforce.",
};

const frame = (over: Partial<ProjectCreatePageProps> = {}) => ({
  node: { id: "create", label: "Create" },
  ancestors: [],
  currentPath: "/projects/p1/create",
  data: { ideas: [idea] },
  ...over,
});

const box = () => screen.getByLabelText("What would you like to build?") as HTMLTextAreaElement;

describe("ProjectCreatePage", () => {
  it("offers the starter ideas, and picking one puts its prompt in the box without building", () => {
    const page = renderPage(ProjectCreatePage, frame(), ["onBuild"]);
    fireEvent.click(screen.getByText("Enrol newborns in child benefits"));
    expect(box().value).toBe(idea.prompt);
    expect(page.calls("onBuild")).toEqual([]);
  });

  it("builds what was typed, trimmed", () => {
    const page = renderPage(ProjectCreatePage, frame(), ["onBuild"]);
    fireEvent.change(box(), { target: { value: "  Remind mothers of vaccinations  " } });
    fireEvent.click(screen.getByRole("button", { name: "Build" }));
    expect(page.calls("onBuild")).toEqual([["Remind mothers of vaccinations"]]);
  });

  it("says what's missing under the box when Build is pressed empty, and focuses it", () => {
    const page = renderPage(ProjectCreatePage, frame(), ["onBuild"]);
    const build = screen.getByRole("button", { name: "Build" });
    expect(build.hasAttribute("disabled")).toBe(false);
    fireEvent.click(build);
    expect(screen.getByRole("alert").textContent).toBe("Describe what you'd like to build");
    expect(document.activeElement).toBe(box());
    expect(page.calls("onBuild")).toEqual([]);
    fireEvent.change(box(), { target: { value: "Track referrals" } });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("only fills the box with a draft", () => {
    const page = renderPage(ProjectCreatePage, frame({ initialDraft: "A new form for" }), ["onBuild"]);
    expect(box().value).toBe("A new form for");
    expect(page.calls("onBuild")).toEqual([]);
  });
});
