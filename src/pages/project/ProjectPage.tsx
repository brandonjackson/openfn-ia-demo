import { ClipboardList, Plus, Workflow } from "lucide-react";
import type { PageProps } from "../../model/ia-tree";
import type { StatTileData } from "../../model/page-data";
import type { ProjectComponentItem } from "../../model/component-types";
import type { ProjectServiceItem } from "../../model/services";
import type { WorkflowListItem } from "../../model/workflow-list";
import Badge from "../../components/primitives/Badge";
import PageHeader from "../../components/patterns/PageHeader";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import Button from "../../components/primitives/Button";
import Card from "../../components/primitives/Card";
import ComponentRow from "../../components/domain/ComponentRow";
import EmptyState from "../../components/primitives/EmptyState";
import ListRow from "../../components/primitives/ListRow";
import SectionHeading from "../../components/primitives/SectionHeading";
import Stack from "../../components/primitives/Stack";
import StatTile from "../../components/primitives/StatTile";
import TextLink from "../../components/primitives/TextLink";
import WorkflowList from "../../components/domain/WorkflowList";

/** What the Overview draws. */
export interface ProjectPageData {
  /** The project shown. */
  projectId: string;
  /** Headline numbers from Insights and History, linking through. */
  tiles: StatTileData[];
  /** Its workflows, most recently run first. Empty for a new project, which shows an empty state. */
  workflows: WorkflowListItem[];
  /** What the project publishes. Absent without the service catalog. */
  services?: ProjectServiceItem[];
  /** What it's built from. Absent without components. */
  components?: ProjectComponentItem[];
}

/** The Overview's contract: the project's numbers, workflows, services and components, and starting a workflow. */
export interface ProjectPageProps extends PageProps<ProjectPageData> {
  /** Opens a blank workflow in this project, from the empty state. */
  onNewWorkflow: () => void;
  /** Turns a workflow's triggers on or off. Left out, the rows have no switch. */
  onToggleWorkflow?: (id: string, enabled: boolean) => Promise<void>;
  /** Makes a copy of a workflow in the project, paused. Left out, the rows have no Make a copy. */
  onCopyWorkflow?: (id: string) => Promise<void>;
  /** Deletes a workflow, once confirmed. Left out, the rows have no Delete. */
  onDeleteWorkflow?: (id: string) => Promise<void>;
}

/** How many components the Overview lists before "View all". */
const COMPONENT_PREVIEW = 6;

/**
 * A project at a glance: how it's running (its work orders over the last
 * 30 days, which its workflows' rows add up to), its workflows (the same
 * list as the Workflows page, in its sections, with its switches and menus),
 * then what it publishes and is built from. Services and components are left out when
 * their data is (their feature is off).
 */
export default function ProjectPage({ node, ancestors, currentPath, data, onNewWorkflow, onToggleWorkflow, onCopyWorkflow, onDeleteWorkflow }: ProjectPageProps) {
  const { tiles, workflows, services, components } = data;

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
            <WorkflowList workflows={workflows} onToggleWorkflow={onToggleWorkflow} onCopyWorkflow={onCopyWorkflow} onDeleteWorkflow={onDeleteWorkflow} />
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

      <div className={`grid grid-cols-1 gap-8 ${services && components ? "lg:grid-cols-2" : ""}`}>
        {services && (
          <section>
            <SectionHeading
              title="Service listings"
              description="How this project's services are listed for the rest of the organization."
            />
            {services.length > 0 ? (
              <div className="-mt-3 space-y-2">
                {services.map((svc) => (
                  <ListRow
                    key={svc.id}
                    icon={ClipboardList}
                    title={svc.name}
                    badges={<Badge label={svc.status} />}
                    description={svc.description}
                    to={`${currentPath}/services/${svc.id}`}
                    menu={{}}
                  />
                ))}
              </div>
            ) : (
              <div className="-mt-3">
                <EmptyState
                  icon={ClipboardList}
                  title="No published services yet"
                  description="Publish a workflow as a service to list it in Services."
                />
              </div>
            )}
          </section>
        )}

        {components && (
          <section>
            <SectionHeading
              title="Components"
              description={`${components.length} building block${components.length !== 1 ? "s" : ""} in this project.`}
              action={
                components.length > 0 && (
                  <TextLink to={`${currentPath}/components`} variant="action">
                    View all
                  </TextLink>
                )
              }
            />
            {components.length > 0 ? (
              <Card flush className="-mt-3 space-y-0.5 p-1.5">
                {components.slice(0, COMPONENT_PREVIEW).map((comp) => (
                  <ComponentRow key={comp.id} component={comp} projectPath={currentPath} />
                ))}
              </Card>
            ) : (
              <div className="-mt-3">
                <EmptyState
                  title="No components yet"
                  description="Add one from the Components page."
                />
              </div>
            )}
          </section>
        )}
      </div>
    </Stack>
  );
}
