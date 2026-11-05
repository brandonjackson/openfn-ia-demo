
/**
 * Every adaptor a step can use, sorted into the categories the "Connect a
 * system" picker shows. Ids, names and versions come from the adaptors
 * storybook (github.com/brandonjackson/adaptors-storybook, packages/*); the
 * categories are ours.
 */

export interface CatalogAdaptor {
  id: string;
  name: string;
  /** One line on what the system is. */
  description: string;
  /** Latest published version. */
  version: string;
}

/** A titled list of adaptors inside a category, e.g. "Email" under Messaging. */
export interface CatalogGroup {
  label: string;
  adaptors: string[];
}

export interface CatalogCategory {
  id: string;
  label: string;
  groups: CatalogGroup[];
}

export interface AiAction {
  id: string;
  label: string;
  description: string;
  /** The step's starting code: a prompt over the incoming data. */
  body: string;
}
