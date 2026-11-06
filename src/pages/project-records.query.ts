/*
 * What the .query wrappers share about projects: a project from the API with
 * the parts that haven't moved to the API yet (its services, components and
 * sandboxes) filled in from its fixture, and its card on the projects list.
 */
import type { FeatureFlags } from "../model/feature-flags";
import type { ProjectSummary, WorkflowListItem } from "../model/page-data";
import { isLive, type WorkflowDocument } from "../model/workflow-document";
import type { Project, ProjectDetails } from "../model/projects";
import type { WorkOrder } from "../model/workflow";
import { workOrderActivity, type ActivityPeriod } from "../model/runs";
import { timeAgo } from "../model/time";
import { fixtureProject, fixtureWorkflow } from "../fixtures/projects";
import { summaryFor } from "./flagged.fixtures";

/**
 * The model's `Project` for a project from the API: the API's name,
 * description and environment, and, for a project seeded from the fixtures,
 * its fixture's services, components and sandboxes. A project made on the API
 * starts with none of those.
 */
export function asProject(details: ProjectDetails): Project {
  const fixture = fixtureProject(details.id);
  return {
    id: details.id,
    name: details.name,
    description: details.description,
    environment: details.env,
    lastActivity: timeAgo(details.lastActivity ?? null),
    memberCount: details.collaboratorsCount ?? 0,
    sandboxes: fixture?.sandboxes ?? ["main"],
    services: fixture?.services ?? [],
    components: fixture?.components ?? [],
  };
}

/** A project's card on the projects list, without service counts when there's no service catalog. */
export function asSummary(details: ProjectDetails, flags: FeatureFlags): ProjectSummary {
  const services = fixtureProject(details.id)?.services ?? [];
  return summaryFor(
    {
      id: details.id,
      name: details.name,
      description: details.description,
      environment: details.env,
      lastActivity: timeAgo(details.lastActivity ?? null),
      memberCount: details.collaboratorsCount ?? 0,
      workflowCount: details.workflowsCount ?? 0,
      serviceCount: services.length,
      liveServiceCount: services.filter((s) => s.status === "Live").length,
    },
    flags,
  );
}

/** The projects you're a member of that aren't being deleted: what the projects list and the sidebar show. */
export const isOpenable = (p: ProjectDetails) => !!p.role && !p.scheduledDeletion;

/** How far back a project's Overview and Workflows list count work orders, as Lightning's workflow list does. */
export const LIST_PERIOD: ActivityPeriod = "30d";

/**
 * A workflow's row: what the API says (its name, whether it's on, its
 * trigger, when it changed), what its work orders on the API add up to over
 * the last 30 days (the same ones History lists), and, until they move to
 * the API, its description, service status and members from the fixtures.
 */
export function asListItem(doc: WorkflowDocument, serviceCatalog: boolean, workOrders: WorkOrder[]): WorkflowListItem {
  const fixture = fixtureWorkflow(doc.id)?.item;
  const { workOrders: count, failedWorkOrders, latestRun, lastRunAt } = workOrderActivity(workOrders, LIST_PERIOD);
  return {
    id: doc.id,
    name: doc.name,
    description: fixture?.description ?? "",
    type: "Workflow",
    serviceStatus: serviceCatalog ? fixture?.serviceStatus : undefined,
    latestRun,
    lastRunAt,
    members: fixture?.members ?? [],
    updatedAt: doc.updated_at,
    enabled: isLive(doc),
    triggerType: doc.triggers[0]?.type,
    workOrders: count,
    failedWorkOrders,
  };
}

/** Each workflow's work orders, by its id. */
export function byWorkflow(records: { workflowId: string; workOrder: WorkOrder }[]): (workflowId: string) => WorkOrder[] {
  const groups = new Map<string, WorkOrder[]>();
  for (const r of records) groups.set(r.workflowId, [...(groups.get(r.workflowId) ?? []), r.workOrder]);
  return (workflowId) => groups.get(workflowId) ?? [];
}

