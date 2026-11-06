/*
 * What the .query wrappers share about a project's components besides its
 * workflows: its channels and collections from Lightning's API, and its
 * forms, artifacts, AI skills, documents and static websites from the
 * demo's, as one list, with the saves that go with each.
 */
import { useCollectionItemSaves, useCollections, useCollectionSaves } from "../api/collections";
import { useComponents, useComponentSaves } from "../api/project-components";
import { combine } from "../api/status";
import type { ProjectComponentItem } from "../model/page-data";
import type { ProjectDetails } from "../model/projects";
import { formatBytes } from "../model/project-settings";
import { useProjectChannels } from "./channel-records.query";

/**
 * A project's components, all but its workflows, and how to change them.
 * Collections are listed only for those who manage them (owners and admins),
 * as Lightning's API has it. The list isn't trimmed by the feature flags;
 * the wrapper does that (`componentsFor`).
 */
export function useProjectComponents(project: ProjectDetails | undefined) {
  const projectId = project?.id;
  const canManageCollections = !!project?.permissions?.manage_collection;
  const channels = useProjectChannels(projectId);
  const { status: collectionsStatus, collections } = useCollections(projectId ?? "", !!projectId && canManageCollections);
  const { status: contentStatus, components: contents } = useComponents(projectId);
  const collectionSaves = useCollectionSaves();
  const itemSaves = useCollectionItemSaves(projectId ?? "");
  const componentSaves = useComponentSaves(projectId ?? "");

  const items: ProjectComponentItem[] = [
    ...channels.channels.map((c) => c.component),
    ...collections.map((c) => ({
      id: c.id,
      name: c.name,
      description: `${c.itemCount.toLocaleString("en-GB")} ${c.itemCount === 1 ? "key" : "keys"}, ${formatBytes(c.byteSize)}`,
      type: "Collection" as const,
    })),
    ...contents.map((c) => c.component),
  ];

  return {
    status: combine(channels.status, collectionsStatus, contentStatus),
    /** Every component but the workflows, for the lists. */
    items,
    channels,
    collections,
    canManageCollections,
    contents,
    saves: {
      collections: collectionSaves,
      items: itemSaves,
      components: componentSaves,
    },
  };
}
