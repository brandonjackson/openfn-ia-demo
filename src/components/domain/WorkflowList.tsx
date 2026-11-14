import { useState } from "react";
import { workflowSections, workflowSectionTitles, type WorkflowListItem } from "../../model/workflow-list";
import ConfirmModal from "../primitives/ConfirmModal";
import ListGroup from "../primitives/ListGroup";
import Stack from "../primitives/Stack";
import ServiceListingFormModal, { type ServiceListingDraft } from "./ServiceListingFormModal";
import WorkflowRow from "./WorkflowRow";

interface Props {
  /** The workflows to list, in the order each section shows them. */
  workflows: WorkflowListItem[];
  /** Turns a workflow's triggers on or off. Left out, the rows have no switch. */
  onToggleWorkflow?: (id: string, enabled: boolean) => Promise<void>;
  /** Makes a copy of a workflow. Left out, the rows have no Make a copy. */
  onCopyWorkflow?: (id: string) => Promise<void>;
  /** Publishes a workflow as a service under the listing written in its form. Left out, no row offers Publish. */
  onPublishWorkflow?: (id: string, listing: ServiceListingDraft) => Promise<void>;
  /** Deletes a workflow, once confirmed. Left out, the rows have no Delete. */
  onDeleteWorkflow?: (id: string) => Promise<void>;
}

/**
 * A project's workflows, as its Workflows list and Overview both show them:
 * split into Published services, Live workflows and Paused workflows (empty
 * sections left out), each a `WorkflowRow` with its switch and ⋮ menu. Delete
 * asks first; Publish, on a workflow that isn't published, opens its listing
 * form. Whoever feeds it says how each action went; a refusal leaves
 * the list as the server has it.
 */
export default function WorkflowList({ workflows, onToggleWorkflow, onCopyWorkflow, onPublishWorkflow, onDeleteWorkflow }: Props) {
  // UI state: the workflow waiting on a delete confirm, and whether a delete or a copy is under way.
  const [deleting, setDeleting] = useState<WorkflowListItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [copying, setCopying] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<WorkflowListItem | null>(null);

  /** Copies a workflow, once at a time; the wrapper says how it went. */
  const copy = async (id: string) => {
    if (copying || !onCopyWorkflow) return;
    setCopying(id);
    try {
      await onCopyWorkflow(id);
    } catch {
      // Refused: the wrapper said why.
    } finally {
      setCopying(null);
    }
  };

  return (
    <>
      <Stack gap="xl">
        {workflowSections(workflows).map(({ section, workflows: rows }) => (
          <ListGroup key={section} title={workflowSectionTitles[section]} count={rows.length}>
            {rows.map((w) => (
              <WorkflowRow
                key={w.id}
                workflow={w}
                onToggleEnabled={onToggleWorkflow && ((enabled) => void onToggleWorkflow(w.id, enabled).catch(() => {}))}
                onCopy={onCopyWorkflow && (() => void copy(w.id))}
                onPublish={onPublishWorkflow && !w.published ? () => setPublishing(w) : undefined}
                onDelete={onDeleteWorkflow && (() => setDeleting(w))}
              />
            ))}
          </ListGroup>
        ))}
      </Stack>

      {onPublishWorkflow && (
        <ServiceListingFormModal
          open={publishing !== null}
          workflowName={publishing?.name}
          onClose={() => setPublishing(null)}
          onSubmit={(listing) => onPublishWorkflow(publishing!.id, listing)}
        />
      )}

      <ConfirmModal
        open={deleting !== null}
        title="Delete workflow"
        confirmLabel={busy ? "Deleting…" : "Delete workflow"}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (busy || !deleting || !onDeleteWorkflow) return;
          setBusy(true);
          try {
            // The wrapper says how it went.
            await onDeleteWorkflow(deleting.id);
          } catch {
            // Refused: the wrapper said why.
          } finally {
            setBusy(false);
            setDeleting(null);
          }
        }}
      >
        <p>Are you sure you'd like to delete "{deleting?.name}"?</p>
        <p>Its triggers stop at once. Runs it has already made stay in History.</p>
      </ConfirmModal>
    </>
  );
}
