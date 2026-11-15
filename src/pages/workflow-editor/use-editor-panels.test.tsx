import { act, fireEvent, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { defaultLayout, resetLayout, type EditorLayout } from "../../components/domain/editor-layout";
import { useEditorPanels } from "./use-editor-panels";

type Where = { onPage: boolean; inCode: boolean };
const setup = (initial?: Partial<EditorLayout>, where: Where = { onPage: false, inCode: true }) =>
  renderHook(({ onPage, inCode }: Where) => useEditorPanels({ initial, onPage, inCode }), { initialProps: where });
const press = (key: string) => act(() => void fireEvent.keyDown(document, { key, ctrlKey: true }));

describe("useEditorPanels", () => {
  beforeEach(() => act(() => resetLayout()));

  it("starts from the remembered layout, with what's pinned for this visit on top", () => {
    const { result } = setup({ assistant: true, explorer: false });
    expect(result.current.layout).toEqual({ ...defaultLayout, assistant: true, explorer: false });
  });

  it("lets a pinned part give way the first time it's changed, and remembers the change", () => {
    const first = setup({ assistant: true });
    act(() => first.result.current.toggleAssistant());
    expect(first.result.current.layout.assistant).toBe(false);
    act(() => first.result.current.toggleAssistant());
    expect(first.result.current.layout.assistant).toBe(true);
    // Another visit with nothing pinned opens the way it was left.
    first.unmount();
    expect(setup().result.current.layout.assistant).toBe(true);
  });

  it("opens the panel at its smaller size on the runs tab, unless a view is asked for", () => {
    const { result } = setup({ panelMaximized: true, panelView: "failures" });
    act(() => result.current.togglePanel());
    expect(result.current.layout).toMatchObject({ panel: true, panelMaximized: false, panelView: "runs" });
    act(() => result.current.togglePanel());
    act(() => result.current.showPanel("log"));
    expect(result.current.layout).toMatchObject({ panel: true, panelView: "log" });
  });

  it("hides the bottom and right panels on a page, and shows them there only until you leave it", () => {
    const { result, rerender } = setup({ panel: true, details: true });
    rerender({ onPage: true, inCode: true });
    expect(result.current.shownLayout).toMatchObject({ panel: false, details: false });
    // Shown on the page: for the page only. The layout it'll go back to hasn't changed.
    act(() => result.current.changeLayout({ panel: true }));
    expect(result.current.shownLayout.panel).toBe(true);
    act(() => result.current.changeLayout({ panel: false, details: true }));
    expect(result.current.shownLayout).toMatchObject({ panel: false, details: true });
    expect(result.current.layout).toMatchObject({ panel: true, details: true });
    // Another page starts hidden again; back in code, the panels are as they were.
    act(() => result.current.hidePagePanels());
    expect(result.current.shownLayout).toMatchObject({ panel: false, details: false });
    rerender({ onPage: false, inCode: true });
    expect(result.current.shownLayout).toMatchObject({ panel: true, details: true });
  });

  it("changes anything but those two panels for good, even from a page", () => {
    const { result } = setup(undefined, { onPage: true, inCode: true });
    act(() => result.current.changeLayout({ assistant: true, panel: true }));
    expect(result.current.layout.assistant).toBe(true);
    expect(result.current.layout.panel).toBe(false);
    expect(result.current.shownLayout.panel).toBe(true);
  });

  it("toggles the assistant with Ctrl+K, the panel with J and, in code mode only, the explorer with B", () => {
    const { result, rerender } = setup();
    press("k");
    expect(result.current.layout.assistant).toBe(true);
    press("j");
    expect(result.current.layout.panel).toBe(true);
    press("b");
    expect(result.current.layout.explorer).toBe(false);
    // On the canvas there's no explorer to toggle.
    rerender({ onPage: false, inCode: false });
    press("b");
    expect(result.current.layout.explorer).toBe(false);
    // Without Ctrl or ⌘ a key is just a key.
    act(() => void fireEvent.keyDown(document, { key: "k" }));
    expect(result.current.layout.assistant).toBe(true);
  });
});
