import { useState } from "react";
import { Plus, Search, Workflow } from "lucide-react";
import type { PageProps } from "../../model/ia-tree";
import PageHeader from "../../components/patterns/PageHeader";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import WorkflowRow from "../../components/domain/WorkflowRow";
import Button from "../../components/primitives/Button";
import Callout from "../../components/primitives/Callout";
import ConfirmModal from "../../components/primitives/ConfirmModal";
import EmptyState from "../../components/primitives/EmptyState";
import { Select } from "../../components/primitives/FormControls";
import Inline from "../../components/primitives/Inline";
import SearchInput from "../../components/primitives/SearchInput";
import SectionHeading from "../../components/primitives/SectionHeading";
import Stack from "../../components/primitives/Stack";
import type { WorkflowListItem } from "../../model/workflow-list";
import { errorMessageOf } from "../../model/form-error";

/** What the Workflows list draws. */
export interface ProjectWorkflowsPageData {
  /** The project the workflows belong to. */
  projectId: string;
  /** Every workflow in it, as rows. */
  workflows: WorkflowListItem[];
}

/** The Workflows list's contract: the project's workflows, and what the viewer may do with them. */
export interface ProjectWorkflowsPageProps extends PageProps<ProjectWorkflowsPageData> {
  /** Opens a blank workflow in this project. */
  onNewWorkflow: () => void;
  /** Turns a workflow's triggers on or off. Left out, the rows have no switch. */
  onToggleWorkflow?: (id: string, enabled: boolean) => Promise<void>;
  /** Deletes a workflow, once confirmed. Left out, the rows have no Delete. */
  onDeleteWorkflow?: (id: string) => Promise<void>;
}

const sorts: Record<string, (a: WorkflowListItem, b: WorkflowListItem) => number> = {
  "Sort by: Activity": (a, b) => (b.lastRunAt ?? "").localeCompare(a.lastRunAt ?? ""),
  "Sort by: Last updated": (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  "Sort by: Name": (a, b) => a.name.localeCompare(b.name),
  "Sort by: Work orders": (a, b) => b.workOrders - a.workOrders,
  "Sort by: Failed": (a, b) => b.failedWorkOrders - a.failedWorkOrders,
};
const sortOptions = Object.keys(sorts);

export default function ProjectWorkflowsPage({
  node,
  ancestors,
  data,
  onNewWorkflow,
  onToggleWorkflow,
  onDeleteWorkflow,
}: ProjectWorkflowsPageProps) {
  // UI state: the sort, the search, the workflow waiting on a delete confirm, and what the last delete did.
  const [sort, setSort] = useState(sortOptions[0]);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<WorkflowListItem | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; title: string; detail?: string }>();
  const [busy, setBusy] = useState(false);

  /** Switches a workflow on or off, saying so if the server refuses. */
  const toggle = async (w: WorkflowListItem, enabled: boolean) => {
    try {
      await onToggleWorkflow?.(w.id, enabled);
    } catch (error) {
      setNotice({ tone: "danger", title: `"${w.name}" wasn't turned ${enabled ? "on" : "off"}`, detail: errorMessageOf(error) });
    }
  };

  const q = query.trim().toLowerCase();
  const workflows = data.workflows.filter((w) => !q || w.name.toLowerCase().includes(q)).sort(sorts[sort]);
  const count = data.workflows.length;

  return (
    <Stack gap="xl">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
        title={node.label}
        description={node.description}
        actions={
          <Button icon={Plus} size="sm" onClick={onNewWorkflow}>
            New workflow
          </Button>
        }
      />

      {notice && (
        <Callout variant={notice.tone} title={notice.title} role={notice.tone === "danger" ? "alert" : undefined}>
          {notice.detail}
        </Callout>
      )}

      {count > 0 ? (
        <section>
          <SectionHeading
            variant="label"
            title={q ? `${workflows.length} of ${count} workflows` : `${count} workflow${count === 1 ? "" : "s"}`}
            action={
              <Inline gap="sm">
                <SearchInput
                  compact
                  placeholder="Search"
                  aria-label="Search workflows"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Select aria-label="Sort workflows" options={sortOptions} value={sort} onChange={(e) => setSort(e.target.value)} />
              </Inline>
            }
          />
          {workflows.length > 0 ? (
            <Stack gap="sm">
              {workflows.map((w) => (
                <WorkflowRow
                  key={w.id}
                  workflow={w}
                  onToggleEnabled={onToggleWorkflow && ((enabled) => void toggle(w, enabled))}
                  onDelete={onDeleteWorkflow && (() => setDeleting(w))}
                />
              ))}
            </Stack>
          ) : (
            <EmptyState icon={Search} title={`No workflows match "${query.trim()}"`} description="Try another name." />
          )}
        </section>
      ) : (
        <EmptyState
          icon={Workflow}
          title="No workflows yet"
          description="Workflows move data between your connected systems."
          action={
            <Button icon={Plus} onClick={onNewWorkflow}>
              Create one
            </Button>
          }
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
            await onDeleteWorkflow(deleting.id);
            setNotice({ tone: "success", title: `"${deleting.name}" deleted` });
          } catch (error) {
            setNotice({ tone: "danger", title: `"${deleting.name}" wasn't deleted`, detail: errorMessageOf(error) });
          } finally {
            setBusy(false);
            setDeleting(null);
          }
        }}
      >
        <p>Are you sure you'd like to delete "{deleting?.name}"?</p>
        <p>Its triggers stop at once. Runs it has already made stay in History.</p>
      </ConfirmModal>
    </Stack>
  );
}
