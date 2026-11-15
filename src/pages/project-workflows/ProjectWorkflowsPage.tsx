import { Plus, Workflow } from "lucide-react";
import type { PageProps } from "../../model/ia-tree";
import ListPage from "../../components/patterns/ListPage";
import PageHeader from "../../components/patterns/PageHeader";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import WorkflowList from "../../components/domain/WorkflowList";
import type { ServiceListingDraft } from "../../components/domain/ServiceListingFormModal";
import Button from "../../components/primitives/Button";
import EmptyState from "../../components/primitives/EmptyState";
import type { WorkflowListItem } from "../../model/workflow-list";

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
  /** Makes a copy of a workflow in the same project, paused. Left out, the rows have no Make a copy. */
  onCopyWorkflow?: (id: string) => Promise<void>;
  /** Publishes a workflow as a service under the listing written in its form; rejects with why not, shown under its field. Left out (the catalog is off, or you can't), no row offers Publish. */
  onPublishWorkflow?: (id: string, listing: ServiceListingDraft) => Promise<void>;
  /** Deletes a workflow, once confirmed. Left out, the rows have no Delete. */
  onDeleteWorkflow?: (id: string) => Promise<void>;
}

/** Most recently run first; never run last. */
const byActivity = (a: WorkflowListItem, b: WorkflowListItem) => (b.lastRunAt ?? "").localeCompare(a.lastRunAt ?? "");

export default function ProjectWorkflowsPage({
  node,
  ancestors,
  data,
  onNewWorkflow,
  onToggleWorkflow,
  onCopyWorkflow,
  onPublishWorkflow,
  onDeleteWorkflow,
}: ProjectWorkflowsPageProps) {
  const workflows = [...data.workflows].sort(byActivity);

  return (
    <ListPage
      header={
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
      }
      isEmpty={workflows.length === 0}
      empty={
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
      }
    >
      <WorkflowList workflows={workflows} onToggleWorkflow={onToggleWorkflow} onCopyWorkflow={onCopyWorkflow} onPublishWorkflow={onPublishWorkflow} onDeleteWorkflow={onDeleteWorkflow} />
    </ListPage>
  );
}
