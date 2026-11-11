import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { renderPage } from "../test/renderPage";
import WorkflowEditorPage from "./WorkflowEditorPage";
import type { AdaptorReference } from "../model/adaptor-reference";
import type { Workflow } from "../model/workflow";

// The canvas measures itself and the assistant scrolls its thread; jsdom does neither.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.scrollTo ??= () => {};
});

const workflow: Workflow = { id: "w1", name: "Intake", project: "Project A", version: "latest", nodes: [], edges: [] };

const data = {
  workflow,
  sandbox: "fix-intake",
  // Passed once, here: the page's own `= []` defaults are a new list every render (#247).
  workOrders: [],
  dataclips: [],
  adaptors: { info: {} as AdaptorReference["info"], snippets: {} as AdaptorReference["snippets"], choices: [], credentials: [] },
  catalog: { adaptors: [], categories: [], builtInTools: [], aiModels: [], aiActions: [] },
};

describe("WorkflowEditorPage", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("saves an edit a moment after it's made, however often the wrapper sends the same workflow again", async () => {
    const page = renderPage(WorkflowEditorPage, data, ["onSaveWorkflow"]);
    fireEvent.keyDown(document, { key: "r" });
    const input = screen.getByRole("textbox", { name: "Workflow name" });
    fireEvent.change(input, { target: { value: "Renamed" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // The wrapper re-renders partway through the wait, with the same workflow built afresh.
    act(() => vi.advanceTimersByTime(500));
    page.sendProps({ workflow: { ...workflow } });
    act(() => vi.advanceTimersByTime(250));

    expect(page.calls("onSaveWorkflow").map(([graph]) => graph.name)).toEqual(["Renamed"]);
  });
});
