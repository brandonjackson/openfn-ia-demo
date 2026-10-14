import { useMemo } from "react";
import { dataclips, findRun, runLogs, runs, stepsOf, workOrders } from "../../mock-data/history";
import type { HistoryWorkOrder } from "../../components/workflow/MiniHistory";
import type { RunOverlay } from "../../components/workflow/WorkflowDiagram";
import type { WorkflowGraph } from "../../mock-data/workflow";
import { duration } from "../../components/workflow/formatTime";

const EXIT_STATE = { success: "success", fail: "fail", crash: "crash" } as const;

/**
 * Run history for the editor, read from ./history fixtures: the work orders
 * for this workflow, the selected run (?run=) with its steps and logs, and
 * what the canvas paints for it. Lightning gets these over the history and
 * run channels.
 */
export function useEditorRuns(graph: WorkflowGraph, runId: string | null) {
  return useMemo(() => {
    const history: HistoryWorkOrder[] = workOrders
      .filter((w) => w.workflowId === graph.id)
      .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
      .map((workOrder) => ({
        workOrder,
        runs: runs.filter((r) => workOrder.runIds.includes(r.id)).sort((a, b) => b.insertedAt.localeCompare(a.insertedAt)),
      }));
    const ownRuns = history.flatMap((h) => h.runs);
    const run = runId ? findRun(runId) : undefined;
    const selectedRun = run && ownRuns.some((r) => r.id === run.id) ? run : null;
    const selectedSteps = selectedRun ? stepsOf(selectedRun) : [];

    let overlay: RunOverlay | null = null;
    if (selectedRun) {
      const steps: RunOverlay["steps"] = {};
      for (const s of selectedSteps) {
        steps[s.jobId] = {
          state: s.exitReason ? EXIT_STATE[s.exitReason] : "running",
          duration: s.finishedAt ? duration(s.startedAt, s.finishedAt) : undefined,
        };
      }
      const startJob = graph.jobs.find((j) => j.name === selectedRun.startingJob);
      overlay = {
        steps,
        startNodeId: selectedRun.startingTrigger ? (graph.triggers[0]?.id ?? null) : (startJob?.id ?? null),
        startedBy: selectedRun.startingTrigger ? "Trigger" : "editor@openfn.org",
        startedAt: selectedRun.startingTrigger && selectedRun.startedAt ? new Date(selectedRun.startedAt).toLocaleString() : undefined,
      };
    }

    // "Running" in the demo follows the newest run that has steps to show.
    const demoRunId = ownRuns.find((r) => r.stepIds.length > 0)?.id ?? null;

    return {
      history,
      dataclips: dataclips.filter((d) => d.projectId === graph.projectId),
      selectedRun,
      selectedSteps,
      selectedLogs: selectedRun ? (runLogs[selectedRun.id] ?? []) : [],
      overlay,
      demoRunId,
    };
  }, [graph.id, graph.jobs, graph.triggers, graph.projectId, runId]);
}
