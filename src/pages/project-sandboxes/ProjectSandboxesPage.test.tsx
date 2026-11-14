import { fireEvent, screen, within } from "@testing-library/react";
import { FormError } from "../../model/form-error";
import { describe, expect, it } from "vitest";
import type { SandboxItem } from "../../model/sandboxes";
import { renderPage } from "../../test/renderPage";
import ProjectSandboxesPage, { type ProjectSandboxesPageProps } from "./ProjectSandboxesPage";

const sandbox = (name: string, over: Partial<SandboxItem> = {}): SandboxItem => ({
  name,
  isMain: false,
  description: "",
  createdBy: "Amina Diallo",
  lastActivity: new Date().toISOString(),
  color: "indigo",
  parent: "main",
  changes: [],
  credentials: [],
  ...over,
});

const main = sandbox("main", { isMain: true, parent: undefined, color: "gray" });
const sandboxes = [main, sandbox("intake-v2", { changes: [{ workflowId: "w1", workflowName: "Intake", diverged: false }] }), sandbox("dedup")];

const actions = ["onSelectSandbox", "onCreateSandbox", "onEditSandbox", "onMergeSandbox", "onDeleteSandbox"] satisfies (keyof ProjectSandboxesPageProps)[];

const draw = (selectedSandbox = "main") =>
  renderPage(
    ProjectSandboxesPage,
    { node: { id: "sandboxes", label: "Sandboxes" }, ancestors: [], currentPath: "/projects/p1/sandboxes", data: { sandboxes }, selectedSandbox },
    actions,
  );

const section = (title: string) => screen.getByRole("region", { name: title });

describe("ProjectSandboxesPage", () => {
  it("puts the selected sandbox on its own at the top, the rest below, with what each has changed", () => {
    draw("intake-v2");
    expect(within(section("Selected")).getByText("intake-v2")).toBeTruthy();
    expect(within(section("Selected")).getByText("1 changed workflow")).toBeTruthy();
    expect(within(section("Active")).getByText("main")).toBeTruthy();
    expect(within(section("Active")).getByText("dedup")).toBeTruthy();
  });

  it("switches to a sandbox picked from the list", () => {
    const host = draw();
    fireEvent.click(screen.getByText("dedup"));
    expect(host.calls("onSelectSandbox")).toEqual([["dedup"]]);
  });

  it("offers main nothing but Open, and never deleting the sandbox you're in", () => {
    draw("intake-v2");
    fireEvent.click(screen.getByRole("button", { name: "Actions for main" }));
    expect(screen.getAllByRole("menuitem").map((m) => m.textContent)).toEqual(["Open"]);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Actions for intake-v2" }));
    expect(screen.queryByRole("menuitem", { name: "Delete" })).toBeNull();
  });

  it("makes a sandbox from the one you're in, then says so", async () => {
    const host = draw("intake-v2");
    fireEvent.click(screen.getByRole("button", { name: "New sandbox" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Try a fix" } });
    fireEvent.click(screen.getByRole("button", { name: "Create sandbox" }));
    expect(host.calls("onCreateSandbox")[0]![0]).toMatchObject({ name: "Try a fix", parent: "intake-v2" });
    await host.resolve("onCreateSandbox");
    expect(screen.getByText("Created a sandbox from intake-v2.")).toBeTruthy();
  });

  it("deletes a sandbox once it's confirmed, then says so", async () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "Actions for dedup" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete sandbox" }));
    expect(host.calls("onDeleteSandbox")).toEqual([["dedup"]]);
    await host.resolve("onDeleteSandbox");
    expect(screen.getByText("Deleted dedup.")).toBeTruthy();
  });

  it("says why a delete was refused, and keeps the sandbox", async () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "Actions for dedup" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete sandbox" }));
    await host.reject("onDeleteSandbox", new FormError("You can't delete a sandbox you didn't make."));
    expect(screen.getByRole("alert").textContent).toContain("You can't delete a sandbox you didn't make.");
    expect(screen.getByText("dedup")).toBeTruthy();
    expect(screen.queryByText("Deleted dedup.")).toBeNull();
  });
});
