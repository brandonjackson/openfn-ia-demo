import type { FeatureFlags } from "../model/feature-flags";
import { connectionOf, type ConnectedSystem } from "../model/connected-systems";
import { connectedSystems } from "../fixtures/connected-systems";

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
export function systemsFor(flags: FeatureFlags, systems: ConnectedSystem[] = connectedSystems): ConnectedSystem[] {
  if (!flags.connectedSystems) return [];
  return flags.xroad ? systems : systems.filter((s) => !isXRoadSystem(s));
}
