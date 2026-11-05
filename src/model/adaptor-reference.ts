/**
 * What the editor knows about each adaptor a step can use: its display name
 * and version, where its docs live, whether it needs a credential, and a
 * handful of code snippets for its most-used operations.
 */
import type { AdaptorKind } from "./workflow";

/** The operations adaptors share, which the code editor colours as calls. */
export const adaptorOperations = ["fn", "get", "post", "put", "patch", "each", "alterState"] as const;

export interface AdaptorInfo {
  id: AdaptorKind;
  name: string;
  /** The package version pinned in this project, e.g. "2.1". */
  version: string;
  package: string;
  docsUrl: string;
  needsCredential: boolean;
  description: string;
}

export interface Snippet {
  id: string;
  /** What it does, e.g. "Send SMS" or "Search Registered Births". */
  title: string;
  description: string;
  code: string;
}

/** A credential in the project that a step can be given. */
export interface ProjectCredential {
  id: string;
  name: string;
  adaptor: AdaptorKind;
  owner: string;
}

/**
 * What the editor looks up about the adaptors a project's steps can use, and
 * the project's credentials for them.
 */
export interface AdaptorReference {
  /** Each adaptor's name, version, package and docs, by adaptor id. */
  info: Record<AdaptorKind, AdaptorInfo>;
  /** Each adaptor's snippets, by adaptor id. */
  snippets: Record<AdaptorKind, Snippet[]>;
  /** The adaptors a step can be switched to, in picker order. */
  choices: AdaptorKind[];
  /** The project's credentials, for every adaptor. */
  credentials: ProjectCredential[];
}
