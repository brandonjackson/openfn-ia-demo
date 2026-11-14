import { useAnnounce, useAnnounceOutcome } from "../app/announce";
import { useWorkflowSaves } from "../api/workflows";
import type { WorkflowDocument } from "../model/workflow-document";

/**
 * What a project's list of workflows can do, for the wrappers that show one
 * (Workflows and Overview): turn one on or off through its trigger, make a
 * copy (the demo's own route), and delete it. Each says how it went in a
 * toast and resolves once every list showing the workflows has reloaded.
 */
export function useWorkflowListActions(workflows: WorkflowDocument[]) {
  const saves = useWorkflowSaves();
  const announcing = useAnnounceOutcome();
  const announce = useAnnounce();
  const docOf = (id: string) => workflows.find((w) => w.id === id)!;
  return {
    onToggleWorkflow: (id: string, on: boolean) => announcing(saves.setEnabled(docOf(id), on), { failure: `"${docOf(id).name}" wasn't turned ${on ? "on" : "off"}` }),
    onCopyWorkflow: (id: string) =>
      announcing(
        saves.copy(docOf(id)).then((made) => announce({ tone: "success", message: `Made "${made.name}".`, detail: "It's paused until you turn it on." })),
        { failure: `"${docOf(id).name}" wasn't copied` },
      ),
    onDeleteWorkflow: (id: string) => announcing(saves.remove(docOf(id)), { success: `Deleted "${docOf(id).name}".`, failure: `"${docOf(id).name}" wasn't deleted` }),
  };
}
