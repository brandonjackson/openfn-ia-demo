import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AdaptorInfo } from "../../model/adaptor-reference";
import type { AdaptorKind, JobNode, Workflow } from "../../model/workflow";
import { withCode } from "../../model/workflow-edits";
import { useWorkflowEdits } from "./use-workflow-edits";

const step = (id: string): JobNode => ({ id, type: "job", label: id, adaptor: "http", adaptorPackage: "@openfn/language-http", body: "fn(state => state);", x: 0, y: 0 });
const flow = (id: string, name = "Intake"): Workflow => ({ id, name, project: "p", version: "v1", nodes: [step("a")], edges: [] });
const info = {} as Record<AdaptorKind, AdaptorInfo>;
const bodyOf = (w: Workflow) => (w.nodes[0] as JobNode).body;

/** The hook on a workflow, with a save that the test settles and a note of what it was told. */
function setup({ saves = true }: { saves?: boolean } = {}) {
  const onSave = vi.fn<(edited: Workflow) => Promise<void>>(() => Promise.resolve());
  const onNote = vi.fn<(note: string | undefined) => void>();
  const onOtherCopy = vi.fn<(previous: Workflow) => void>();
  const hook = renderHook(({ workflow }: { workflow: Workflow }) => useWorkflowEdits({ workflow, info, onSave: saves ? onSave : undefined, onNote, onOtherCopy }), {
    initialProps: { workflow: flow("w") },
  });
  return { ...hook, onSave, onNote, onOtherCopy };
}

describe("useWorkflowEdits", () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => void vi.useRealTimers());

  it("shows an edit at once and saves it a moment after the last change", async () => {
    const { result, onSave } = setup();
    act(() => result.current.change((e) => withCode(e, "a", "one")));
    expect(bodyOf(result.current.latest)).toBe("one");
    // Another change before the moment is up: one save, of the latest.
    await act(() => vi.advanceTimersByTimeAsync(400));
    act(() => result.current.change((e) => withCode(e, "a", "two")));
    await act(() => vi.advanceTimersByTimeAsync(400));
    expect(onSave).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(400));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(bodyOf(onSave.mock.calls[0]![0])).toBe("two");
  });

  it("saves a new name too", async () => {
    const { result, onSave } = setup();
    act(() => result.current.setName("Intake v2"));
    await act(() => vi.advanceTimersByTimeAsync(800));
    expect(onSave.mock.calls[0]![0].name).toBe("Intake v2");
  });

  it("clears edits once they're saved, and doesn't save again until there's something new", async () => {
    const { result, rerender, onSave, onNote } = setup();
    act(() => result.current.change((e) => withCode(e, "a", "one")));
    await act(() => vi.advanceTimersByTimeAsync(800));
    expect(onNote).toHaveBeenLastCalledWith(undefined);
    // The server's copy comes back with the change in it.
    rerender({ workflow: { ...flow("w"), nodes: [{ ...step("a"), body: "one" }] } });
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(bodyOf(result.current.latest)).toBe("one");
  });

  it("keeps the edits and says why when a save is refused", async () => {
    const { result, onSave, onNote } = setup();
    onSave.mockRejectedValueOnce(new Error("Name has already been taken."));
    act(() => result.current.change((e) => withCode(e, "a", "one")));
    await act(() => vi.advanceTimersByTimeAsync(800));
    expect(onNote).toHaveBeenLastCalledWith("Not saved: Name has already been taken.");
    expect(bodyOf(result.current.latest)).toBe("one");
  });

  it("never saves where there's nowhere to save to", async () => {
    const { result, onSave } = setup({ saves: false });
    act(() => result.current.change((e) => withCode(e, "a", "one")));
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(onSave).not.toHaveBeenCalled();
    expect(await result.current.saveNow()).toBe(true);
  });

  it("saves now when asked, once, and answers whether the server has the workflow as shown", async () => {
    const { result, onSave } = setup();
    // Nothing to save: it's already there.
    expect(await result.current.saveNow()).toBe(true);
    expect(onSave).not.toHaveBeenCalled();
    act(() => result.current.change((e) => withCode(e, "a", "one")));
    let saved: boolean | undefined;
    await act(async () => {
      saved = await result.current.saveNow();
    });
    expect(saved).toBe(true);
    // The timer that was waiting on that edit has nothing left to save.
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(onSave).toHaveBeenCalledTimes(1);
    // Refused: false, so whatever was waiting on the save doesn't go ahead.
    onSave.mockRejectedValueOnce(new Error("No."));
    act(() => result.current.change((e) => withCode(e, "a", "two")));
    await act(async () => {
      saved = await result.current.saveNow();
    });
    expect(saved).toBe(false);
  });

  it("starts afresh on another copy of the workflow, and says what was showing", () => {
    const { result, rerender, onOtherCopy } = setup();
    act(() => result.current.change((e) => withCode(e, "a", "one")));
    act(() => result.current.setName("Renamed"));
    rerender({ workflow: flow("sandbox-copy", "Intake") });
    expect(onOtherCopy).toHaveBeenCalledTimes(1);
    const previous = onOtherCopy.mock.calls[0]![0];
    expect(previous.id).toBe("w");
    expect(bodyOf(previous)).toBe("one");
    // The new copy has none of the old one's edits, nor its typed name.
    expect(result.current.latest).toEqual(flow("sandbox-copy", "Intake"));
    expect(result.current.name).toBe("Intake");
  });
});
