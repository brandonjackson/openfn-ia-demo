/**
 * What the editor knows about each adaptor a step can use: its display name
 * and version, where its docs live, whether it needs a credential, and a
 * handful of code snippets for its most-used operations.
 */
import type { AdaptorKind } from "./workflow";
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
