/*
 * Which credential a step runs with, and which it could. A step's "type" is
 * the connected system it talks to; the system's adaptor is the credential's
 * schema, so the project's credentials on that adaptor are the ones that can
 * reach it. Each credential holds values per environment, and a step only
 * offers the ones with values where it runs: the sandbox's environment, or
 * production on main.
 */
import type { AdaptorInfo, ProjectCredential } from "./adaptor-reference";
import { connectionOf } from "./connected-systems";
import type { ConnectedSystem } from "./connected-systems";
import type { AdaptorKind } from "./workflow";

/**
 * Whether a step runs with a credential: its adaptor needs one, unless its
 * system is reached over X-Road, where the Security Server adds the
 * organisation's identity instead.
 */
export function stepNeedsCredential(info: Pick<AdaptorInfo, "needsCredential"> | undefined, system?: ConnectedSystem): boolean {
  if (!info?.needsCredential) return false;
  return !system || connectionOf(system).method === "direct";
}

/** Whether a step needs a credential and hasn't been given one: the canvas offers Connect. */
export function stepMissingCredential(
  info: Pick<AdaptorInfo, "needsCredential"> | undefined,
  system: ConnectedSystem | undefined,
  credentialId: string | undefined,
): boolean {
  return stepNeedsCredential(info, system) && !credentialId;
}

/**
 * The project's credentials a step on `adaptor` can use in `environment`:
 * those on the adaptor's schema with values for that environment. A
 * credential whose environments the API hasn't said is offered anywhere.
 */
export function credentialsForStep(credentials: ProjectCredential[], adaptor: AdaptorKind, environment: string): ProjectCredential[] {
  return credentials.filter((c) => c.adaptor === adaptor && (!c.environments || c.environments.includes(environment)));
}
