import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ProjectComponentItem, ProjectComponentType } from "../../model/component-types";
import { FormError } from "../../model/form-error";
import { renderPage } from "../../test/renderPage";
import ProjectComponentsPage, { type ProjectComponentsPageProps } from "./ProjectComponentsPage";

const component = (name: string, type: ProjectComponentType): ProjectComponentItem => ({ id: name, name, description: `About ${name}`, type });

const every: ProjectComponentType[] = ["Channel", "Form", "Artifact", "Collection", "AI Skill", "Document", "Static Website"];

const frame: Omit<ProjectComponentsPageProps, "data" | `on${string}`> = {
  node: { id: "components", label: "Components", description: "Every building block in this project." },
  ancestors: [],
  currentPath: "/projects/p/components",
  channelCredentials: ["DHIS2 production"],
};

const actions = ["onCreateChannel", "onCreateCollection", "onCreateComponent", "onDraftWithAI"] as const;

/** Opens New component and picks a kind. */
function pick(kind: string) {
  fireEvent.click(screen.getAllByRole("button", { name: "New component" })[0]!);
  fireEvent.click(within(screen.getByRole("dialog")).getByText(kind));
}

const draw = (components: ProjectComponentItem[], types = every, only: readonly (typeof actions)[number][] = actions) =>
  renderPage(ProjectComponentsPage, { ...frame, data: { projectId: "p", components, types } }, [...only]);

describe("ProjectComponentsPage", () => {
  it("groups the components it's given by kind, leaving out empty kinds", () => {
    draw([component("Referrals", "Channel"), component("Intake form", "Form"), component("Patient lookup", "Collection")]);
    expect(within(screen.getByRole("region", { name: "Channels" })).getByText("1")).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Forms" })).getByText("1")).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Collections" })).getByText("1")).toBeTruthy();
    expect(screen.queryByText(/^Documents/)).toBeNull();
    expect(screen.getByText("About Intake form")).toBeTruthy();
  });

  it("lists each component as a full-width row that opens it, with a menu starting with Open", () => {
    draw([component("Intake form", "Form")]);
    expect(screen.getByText("Intake form").closest("a")!.getAttribute("href")).toBe("/projects/p/components/Intake form");
    fireEvent.click(screen.getByRole("button", { name: "Actions for Intake form" }));
    expect(screen.getByRole("menuitem", { name: "Open" })).toBeTruthy();
  });

  it("keeps the kinds out of sight until New component is pressed", () => {
    draw([component("Intake form", "Form")]);
    expect(screen.queryByText("Add project component")).toBeNull();
    expect(screen.queryByText("Static Website")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "New component" }));
    const dialog = screen.getByRole("dialog", { name: "New component" });
    expect(within(dialog).getByText("Static Website")).toBeTruthy();
    fireEvent.click(within(dialog).getByText("Document"));
    expect(screen.queryByRole("dialog", { name: "New component" })).toBeNull();
    expect(screen.getByRole("button", { name: "Create document" })).toBeTruthy();
  });

  it("lists only the kinds in its types", () => {
    draw([component("Referrals", "Channel"), component("Intake form", "Form")], ["Channel"]);
    expect(within(screen.getByRole("region", { name: "Channels" })).getByText("1")).toBeTruthy();
    expect(screen.queryByText("Intake form")).toBeNull();
  });

  it("says there are none yet, and what components are", () => {
    draw([]);
    expect(screen.getByText("No components yet")).toBeTruthy();
    expect(screen.getByText(/building blocks of a project/)).toBeTruthy();
  });

  it("makes a document from the panel, closes the form once it's made, and keeps the form open with the server's reason when refused", async () => {
    const host = draw([]);
    pick("Document");
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Runbook" } });
    fireEvent.click(screen.getByRole("button", { name: "Create document" }));
    expect(host.calls("onCreateComponent")).toEqual([["Document", { name: "Runbook", description: "" }]]);
    await host.reject("onCreateComponent", new FormError("Something went wrong."));
    expect(screen.getByText("Something went wrong.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Create document" }));
    await host.resolve("onCreateComponent");
    expect(screen.queryByRole("button", { name: "Create document" })).toBeNull();
  });

  it("makes a collection under its URL-safe name", async () => {
    const host = draw([]);
    pick("Collection");
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Patient Lookup" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(host.calls("onCreateCollection")).toEqual([["patient-lookup"]]);
    await host.resolve("onCreateCollection");
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });

  it("offers to hand a kind to AI from its form, with Build with AI", () => {
    const host = draw([]);
    pick("Form");
    fireEvent.click(screen.getByRole("button", { name: "Describe it to AI instead" }));
    expect(host.calls("onDraftWithAI")).toEqual([["Form"]]);
  });

  it("with just channels, is the Channels page with a New channel button", () => {
    draw([], ["Channel"]);
    expect(screen.queryByRole("button", { name: "New component" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "New channel" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("offers nothing to add to a viewer", () => {
    draw([component("Referrals", "Channel")], every, []);
    expect(screen.queryByRole("button", { name: "New component" })).toBeNull();
    expect(screen.queryByRole("button", { name: "New channel" })).toBeNull();
    expect(screen.getByText("Referrals")).toBeTruthy();
  });
});
