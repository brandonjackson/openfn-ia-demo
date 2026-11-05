import type { FeatureFlags } from "../model/feature-flags";
import { connectionOf, type ConnectedSystem } from "../model/connected-systems";
import { connectedSystems } from "../fixtures/connected-systems";
import type { ProjectComponentType, ProjectSummary } from "../model/page-data";
import type { ProjectComponent } from "../model/projects";
import { componentTypes, isComponentTypeShown } from "../model/component-types";

/*
 * The fixtures as the feature flags leave them, for the wrappers that share
 * them. Each wrapper reads the flags in effect (`useFlags`) and hands its
 * page only what's on; pages never read flags.
 */

/** True for a system reached over X-Road, which isn't there without the X-Road flag. */
export function isXRoadSystem(system: ConnectedSystem): boolean {
  return connectionOf(system).method === "xroad";
}

/** The organisation's connected systems: none without the flag, and none reached over X-Road without X-Road. */
export function systemsFor(flags: FeatureFlags): ConnectedSystem[] {
  if (!flags.connectedSystems) return [];
  return flags.xroad ? connectedSystems : connectedSystems.filter((s) => !isXRoadSystem(s));
}

/** A project's summary without its service counts when there's no service catalog. */
export function summaryFor<P extends ProjectSummary>(project: P, flags: FeatureFlags): P {
  if (flags.serviceCatalog) return project;
  return { ...project, serviceCount: undefined, liveServiceCount: undefined };
}

/**
 * A project's components of the kinds the flags leave: the new kinds (forms,
 * static websites…) only with their flags, and without the Components flag
 * just the ones Lightning has, workflows and channels.
 */
export function componentsFor<C extends Pick<ProjectComponent, "type">>(components: C[], flags: FeatureFlags): C[] {
  return components.filter((c) =>
    flags.components ? isComponentTypeShown(c.type, flags) : c.type === "Workflow" || c.type === "Channel"
  );
}

/** The kinds of component that can be listed and added besides workflows, as the flags leave them. */
export function componentTypesFor(flags: FeatureFlags): ProjectComponentType[] {
  return componentTypes
    .map((t) => t.type)
    .filter((type) => type !== "Workflow" && componentsFor([{ type }], flags).length > 0);
}
