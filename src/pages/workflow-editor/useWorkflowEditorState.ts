import { useCallback, useState } from "react";
import type { EditorEdge, EditorJob, EditorTrigger, WorkflowGraph } from "../../mock-data/workflow";

/**
 * The editor's local stand-in for Lightning's Y.Doc-backed WorkflowStore:
 * the graph in React state, with undo / redo and an "unsaved changes" flag.
 * Nothing is persisted; Save just clears the flag.
 */
export function useWorkflowEditorState(initial: WorkflowGraph) {
  const [state, setState] = useState({ graph: initial, past: [] as WorkflowGraph[], future: [] as WorkflowGraph[], saved: initial });

  const change = useCallback((fn: (g: WorkflowGraph) => WorkflowGraph) => {
    setState((s) => {
      const next = fn(s.graph);
      if (next === s.graph) return s;
      return { ...s, graph: next, past: [...s.past, s.graph].slice(-50), future: [] };
    });
  }, []);

  const undo = useCallback(() => {
    setState((s) =>
      s.past.length === 0
        ? s
        : { ...s, graph: s.past[s.past.length - 1], past: s.past.slice(0, -1), future: [s.graph, ...s.future] }
    );
  }, []);

  const redo = useCallback(() => {
    setState((s) =>
      s.future.length === 0 ? s : { ...s, graph: s.future[0], past: [...s.past, s.graph], future: s.future.slice(1) }
    );
  }, []);

  const save = useCallback(() => setState((s) => ({ ...s, saved: s.graph })), []);
  const resetToSaved = useCallback(() => setState((s) => ({ ...s, graph: s.saved, past: [], future: [] })), []);
  const replace = useCallback((graph: WorkflowGraph) => setState({ graph, past: [], future: [], saved: graph }), []);

  const updateJob = useCallback(
    (id: string, patch: Partial<EditorJob>) =>
      change((g) => ({ ...g, jobs: g.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)) })),
    [change]
  );
  const updateTrigger = useCallback(
    (id: string, patch: Partial<EditorTrigger>) =>
      change((g) => ({ ...g, triggers: g.triggers.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
    [change]
  );
  const updateEdge = useCallback(
    (id: string, patch: Partial<EditorEdge>) =>
      change((g) => ({ ...g, edges: g.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
    [change]
  );
  const updateWorkflow = useCallback(
    (patch: Partial<Pick<WorkflowGraph, "name" | "concurrency" | "enableJobLogs">>) => change((g) => ({ ...g, ...patch })),
    [change]
  );
  const setEnabled = useCallback(
    (enabled: boolean) => change((g) => ({ ...g, triggers: g.triggers.map((t) => ({ ...t, enabled })) })),
    [change]
  );
  const removeJob = useCallback(
    (id: string) =>
      change((g) => {
        const positions = { ...g.positions };
        delete positions[id];
        return {
          ...g,
          jobs: g.jobs.filter((j) => j.id !== id),
          edges: g.edges.filter((e) => e.sourceJobId !== id && e.targetJobId !== id),
          positions,
        };
      }),
    [change]
  );
  const removeEdge = useCallback(
    (id: string) => change((g) => ({ ...g, edges: g.edges.filter((e) => e.id !== id) })),
    [change]
  );
  /** The "+" under a node: a new step one rank below, joined on success. Returns its id. */
  const addJobAfter = useCallback(
    (sourceJobId: string) => {
      const id = `job-${Math.random().toString(36).slice(2, 10)}`;
      change((g) => {
        const from = g.positions[sourceJobId] ?? { x: 0, y: 0 };
        const siblings = g.edges.filter((e) => e.sourceJobId === sourceJobId).length;
        return {
          ...g,
          jobs: [
            ...g.jobs,
            { id, name: "New job", adaptor: "@openfn/language-common@latest", body: "", credentialName: null },
          ],
          edges: [
            ...g.edges,
            {
              id: `edge-${id}`,
              sourceTriggerId: null,
              sourceJobId,
              targetJobId: id,
              conditionType: "on_job_success",
              conditionLabel: null,
              conditionExpression: null,
              enabled: true,
            },
          ],
          positions: { ...g.positions, [id]: { x: from.x + siblings * 370, y: from.y + 260 } },
        };
      });
      return id;
    },
    [change]
  );

  return {
    graph: state.graph,
    hasChanges: state.graph !== state.saved,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    undo,
    redo,
    save,
    resetToSaved,
    replace,
    updateJob,
    updateTrigger,
    updateEdge,
    updateWorkflow,
    setEnabled,
    removeJob,
    removeEdge,
    addJobAfter,
  };
}

export type WorkflowEditorState = ReturnType<typeof useWorkflowEditorState>;
