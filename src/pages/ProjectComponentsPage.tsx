import { useState } from "react";
import { Boxes, Plus } from "lucide-react";
import type { ChannelDraft } from "../model/channels";
import ChannelFormModal from "../components/domain/ChannelFormModal";
import Button from "../components/primitives/Button";
import Callout from "../components/primitives/Callout";
import Stack from "../components/primitives/Stack";
import type { PageProps } from "../model/ia-tree";
import type { ProjectComponentsPageData } from "../model/page-data";
import AddComponentPanel from "../components/domain/AddComponentPanel";
import PageHeader from "../components/patterns/PageHeader";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import Card from "../components/primitives/Card";
import ComponentRow from "../components/domain/ComponentRow";
import { componentTypes } from "../model/component-types";
import EmptyState from "../components/primitives/EmptyState";
import SectionHeading from "../components/primitives/SectionHeading";

export interface ProjectComponentsPageProps extends PageProps<ProjectComponentsPageData> {
  /** Starts a new component of a type. Components are drafted from a plain-words description on Create, so without it there's no panel for adding. */
  onAddComponent?: (type: string) => void;
  /** Makes a channel, as Lightning's Channels page does. Left out where you can't. */
  onCreateChannel?: (draft: ChannelDraft) => Promise<void>;
  /** The project's credentials, by name, that a new channel can sign in with. */
  channelCredentials?: string[];
  /** Where an event channel with a given name would listen. */
  channelAddress?: (name: string) => string;
}

/**
 * Every component in the project, grouped by type, under a panel for adding
 * a new one. Workflows have their own page, so they are left out here, as
 * are empty groups. Lists only the kinds in `data.types`: with just
 * channels, it's the project's Channels page.
 */
export default function ProjectComponentsPage({
  node,
  ancestors,
  data,
  onAddComponent,
  onCreateChannel,
  channelCredentials = [],
  channelAddress = (name) => name,
}: ProjectComponentsPageProps) {
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<string>();
  const projectPath = `/projects/${data.projectId}`;
  const types = componentTypes.filter((t) => t.type !== "Workflow" && data.types.includes(t.type));
  const groups = types
    .map((t) => ({ ...t, items: data.components.filter((c) => c.type === t.type) }))
    .filter((g) => g.items.length > 0);

  return (
    <Stack gap="xl">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
        title={node.label}
        description={node.description}
        actions={
          onCreateChannel && (
            <Button icon={Plus} size="sm" variant={onAddComponent ? "secondary" : "primary"} onClick={() => setCreating(true)}>
              New channel
            </Button>
          )
        }
      />

      {created && <Callout variant="success" title={`Created ${created}.`} />}

      {onAddComponent && (
        <div>
          <AddComponentPanel options={types} onSelect={onAddComponent} />
        </div>
      )}

      {groups.length > 0 ? (
        <Stack gap="xl">
          {groups.map((group) => (
            <section key={group.type}>
              <SectionHeading
                title={`${group.plural} (${group.items.length})`}
                description={group.description}
              />
              <Card flush className="-mt-3 space-y-0.5 p-1.5">
                {group.items.map((c) => (
                  <ComponentRow key={c.id} component={c} projectPath={projectPath} showDescription hideType />
                ))}
              </Card>
            </section>
          ))}
        </Stack>
      ) : (
        <EmptyState
          icon={Boxes}
          title={`No ${node.label.toLowerCase()} yet`}
          description={
            types.length > 1
              ? `Components are the building blocks of a project: ${types.map((t) => t.plural.toLowerCase()).join(", ")}.${onAddComponent ? " Add one above." : ""}`
              : undefined
          }
        />
      )}

      {onCreateChannel && (
        <ChannelFormModal
          open={creating}
          takenNames={data.components.filter((c) => c.type === "Channel").map((c) => c.name)}
          credentials={channelCredentials}
          eventAddress={channelAddress}
          onClose={() => setCreating(false)}
          onSubmit={async (draft) => {
            await onCreateChannel(draft);
            setCreated(draft.name.trim());
          }}
        />
      )}
    </Stack>
  );
}
