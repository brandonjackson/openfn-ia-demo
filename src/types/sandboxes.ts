/** The sandboxes page's view of the project tree. Types only: no data, no behaviour. */

export interface SandboxRow {
  id: string;
  name: string;
  color: string | null;
  parentId: string | null;
  /** Environment label, e.g. "staging". Shown as a badge when set. */
  env: string | null;
  scheduledDeletion: string | null;
  canEdit: boolean;
  canDelete: boolean;
  canMerge: boolean;
}
