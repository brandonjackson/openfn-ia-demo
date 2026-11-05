/*
 * What the .query wrappers share about projects: a project from the API with
 * the parts that haven't moved to the API yet (its services, components and
 * sandboxes) filled in from its fixture, and its card on the projects list.
 */
import type { FeatureFlags } from "../model/feature-flags";
import type { ProjectSummary, WorkflowListItem } from "../model/page-data";
import { isLive, type WorkflowDocument } from "../model/workflow-document";
import type { Project, ProjectDetails } from "../model/projects";
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

/**
 * A workflow's row: what the API says (its name, whether it's on, its
 * trigger, when it changed) and, until runs move to the API, its run
 * activity from the fixtures. A workflow made on the API hasn't run yet.
 */
export function asListItem(doc: WorkflowDocument, serviceCatalog: boolean): WorkflowListItem {
  const fixture = fixtureWorkflow(doc.id)?.item;
  return {
    id: doc.id,
    name: doc.name,
    description: fixture?.description ?? "",
    type: "Workflow",
    serviceStatus: serviceCatalog ? fixture?.serviceStatus : undefined,
    latestRun: fixture?.latestRun,
    lastRunAt: fixture?.lastRunAt,
    members: fixture?.members ?? [],
    updatedAt: doc.updated_at,
    enabled: isLive(doc),
    triggerType: doc.triggers[0]?.type,
    workOrders: fixture?.workOrders ?? 0,
    failedWorkOrders: fixture?.failedWorkOrders ?? 0,
  };
}

