/** Collections and their items (api/collections.md). */

/** A named key-value store the project's workflows read and write. */
export interface ProjectCollection {
  id: string;
  /** URL-safe, unique in the project. */
  name: string;
  /** How many keys it holds. */
  itemCount: number;
  /** The total size of its values, in bytes. */
  byteSize: number;
  /** When an item was last written, for display ("2 hours ago"). */
  updatedAt: string;
}

/** One key in a collection, with its value. */
export interface CollectionItem {
  key: string;
  /** The stored value, as JSON text. */
  value: string;
  /** When it was last written, for display. */
  updatedAt: string;
}

/** A collection, from any project on the instance. */
export interface AdminCollection {
  id: string;
  name: string;
  /** The project it belongs to. */
  projectName: string;
  /** That project's id, where the server gives it. */
  projectId?: string;
  /** How many items it holds. */
  items: number;
  /** How much it stores, in bytes. */
  bytes: number;
}
