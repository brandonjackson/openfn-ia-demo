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
  it("offers the starter ideas, and picking one puts its prompt in the box", () => {
    renderPage(ProjectCreatePage, frame(), []);
    fireEvent.click(screen.getByText("Enrol newborns in child benefits"));
    expect(box().value).toBe(idea.prompt);
    expect(screen.queryByText("Drafting your service")).toBeNull();
  });

  it("says it's drafting what was typed once it's sent", () => {
    renderPage(ProjectCreatePage, frame(), []);
    fireEvent.change(box(), { target: { value: "  Remind mothers of vaccinations  " } });
    fireEvent.click(screen.getByRole("button", { name: "Build" }));
    expect(screen.getByText("Drafting your service")).toBeTruthy();
    expect(screen.getByText(/“Remind mothers of vaccinations”/)).toBeTruthy();
  });

  it("arrives already sent with a prompt from the Overview", () => {
    renderPage(ProjectCreatePage, frame({ initialPrompt: "Track referrals" }), []);
    expect(screen.getByText("Drafting your service")).toBeTruthy();
    expect(box().value).toBe("Track referrals");
  });

  it("only fills the box with a draft", () => {
    renderPage(ProjectCreatePage, frame({ initialDraft: "A new form for" }), []);
    expect(box().value).toBe("A new form for");
    expect(screen.queryByText("Drafting your service")).toBeNull();
  });
});
