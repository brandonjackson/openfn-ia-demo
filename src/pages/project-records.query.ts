/*
 * What the .query wrappers share about projects: a project from the API with
 * the parts that haven't moved to the API yet (its services, components and
 * sandboxes) filled in from its fixture, and its card on the projects list.
 */
import type { FeatureFlags } from "../model/feature-flags";
import type { ProjectSummary } from "../model/page-data";
import type { Project, ProjectDetails } from "../model/projects";
import { timeAgo } from "../model/time";
import { fixtureProject } from "../fixtures/projects";
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
