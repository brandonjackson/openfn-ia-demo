/*
 * What the .query wrappers share about projects: a project from the API with
 * the parts that haven't moved to the API yet (its services, components and
 * sandboxes) filled in from its fixture.
 */
import type { Project, ProjectDetails } from "../model/projects";
import { timeAgo } from "../model/time";
import { fixtureProject } from "../fixtures/projects";

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
