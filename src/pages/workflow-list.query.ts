import { useAnnounce, useAnnounceOutcome } from "../app/announce";
import { useServiceSaves } from "../api/services";
import { useWorkflowSaves } from "../api/workflows";
import type { WorkflowDocument } from "../model/workflow-document";

/**
 * What a project's list of workflows can do, for the wrappers that show one
 * (Workflows and Overview): turn one on or off through its trigger, make a
 * copy (the demo's own route), publish it as a service and delete it. Each
 * says how it went in a toast and resolves once every list showing the
 * workflows has reloaded. Publishing is offered only when `canPublish` (the
 * service catalog is on, and you're an owner or admin of the project); its
 * form shows a refusal under its fields, so only success is announced.
 */
export function useWorkflowListActions(workflows: WorkflowDocument[], canPublish = false) {
  const saves = useWorkflowSaves();
  const services = useServiceSaves();
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
    onPublishWorkflow: canPublish
      ? (id: string, listing: { name: string; description: string }) =>
          announcing(
            services.publish(docOf(id).project_id, id, listing).then(() => undefined),
            { success: { message: `Published "${listing.name}".`, detail: "It's listed in the service catalog." } },
          )
      : undefined,
    onDeleteWorkflow: (id: string) => announcing(saves.remove(docOf(id)), { success: `Deleted "${docOf(id).name}".`, failure: `"${docOf(id).name}" wasn't deleted` }),
  };
}
