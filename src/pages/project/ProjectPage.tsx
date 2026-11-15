import { Plus, Workflow } from "lucide-react";
import type { PageProps } from "../../model/ia-tree";
import type { StatTileData } from "../../model/page-data";
import type { WorkflowListItem } from "../../model/workflow-list";
import PageHeader from "../../components/patterns/PageHeader";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import Button from "../../components/primitives/Button";
import EmptyState from "../../components/primitives/EmptyState";
import SectionHeading from "../../components/primitives/SectionHeading";
import Stack from "../../components/primitives/Stack";
import StatTile from "../../components/primitives/StatTile";
import TextLink from "../../components/primitives/TextLink";
import WorkflowList from "../../components/domain/WorkflowList";
import type { ServiceListingDraft } from "../../components/domain/ServiceListingFormModal";

/** What the Overview draws. */
export interface ProjectPageData {
  /** The project shown. */
  projectId: string;
  /** Headline numbers from Insights and History, linking through. */
  tiles: StatTileData[];
  /** Its workflows, most recently run first. Empty for a new project, which shows an empty state. */
  workflows: WorkflowListItem[];
}

/** The Overview's contract: the project's numbers and workflows, and starting a workflow. */
export interface ProjectPageProps extends PageProps<ProjectPageData> {
  /** Opens a blank workflow in this project, from the empty state. */
  onNewWorkflow: () => void;
  /** Turns a workflow's triggers on or off. Left out, the rows have no switch. */
  onToggleWorkflow?: (id: string, enabled: boolean) => Promise<void>;
  /** Makes a copy of a workflow in the project, paused. Left out, the rows have no Make a copy. */
  onCopyWorkflow?: (id: string) => Promise<void>;
  /** Publishes a workflow as a service under the listing written in its form; rejects with why not, shown under its field. Left out (the catalog is off, or you can't), no row offers Publish. */
  onPublishWorkflow?: (id: string, listing: ServiceListingDraft) => Promise<void>;
  /** Deletes a workflow, once confirmed. Left out, the rows have no Delete. */
  onDeleteWorkflow?: (id: string) => Promise<void>;
}

/**
 * A project at a glance: how it's running (its work orders over the last
 * 30 days, which its workflows' rows add up to), its workflows (the same
 * list as the Workflows page, in its sections, with its switches and menus).
 */
export default function ProjectPage({ node, ancestors, currentPath, data, onNewWorkflow, onToggleWorkflow, onCopyWorkflow, onPublishWorkflow, onDeleteWorkflow }: ProjectPageProps) {
  const { tiles, workflows } = data;

  return (
    <Stack gap="xl">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
        title={node.label}
        description={node.description}
      />

      <section>
        <SectionHeading
          title="Last 30 days"
          description="Work orders across this project's workflows, how many failed, and the runs they took."
          action={
            <TextLink to={`${currentPath}/insights`} variant="action">
              View insights
            </TextLink>
          }
        />
        <div className="-mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {tiles.map((tile) => (
            <StatTile
              key={tile.label}
              {...tile}
              trendClassName={tile.label === "Failed" ? "text-red-500" : undefined}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading
          title="Workflows"
          description={
            workflows.length > 0
              ? `${workflows.length} workflow${workflows.length !== 1 ? "s" : ""} in this project.`
              : undefined
          }
          action={
            workflows.length > 0 && (
              <TextLink to={`${currentPath}/workflows`} variant="action">
                View all
              </TextLink>
            )
          }
        />
        <div className="-mt-3">
          {workflows.length > 0 ? (
            <WorkflowList workflows={workflows} onToggleWorkflow={onToggleWorkflow} onCopyWorkflow={onCopyWorkflow} onPublishWorkflow={onPublishWorkflow} onDeleteWorkflow={onDeleteWorkflow} />
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
        </div>
      </section>

    </Stack>
  );
}
