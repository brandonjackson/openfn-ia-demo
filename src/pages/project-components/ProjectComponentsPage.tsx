import { useState } from "react";
import { Boxes, Plus } from "lucide-react";
import type { ChannelDraft } from "../../model/channels";
import { isContentComponentType, type ComponentDraft, type ContentComponentType } from "../../model/project-components";
import ChannelFormModal from "../../components/domain/ChannelFormModal";
import ComponentFormModal from "../../components/domain/ComponentFormModal";
import CollectionNameModal from "../../components/domain/CollectionNameModal";
import Button from "../../components/primitives/Button";
import Callout from "../../components/primitives/Callout";
import Stack from "../../components/primitives/Stack";
import type { PageProps } from "../../model/ia-tree";
import AddComponentPanel from "../../components/domain/AddComponentPanel";
import ListPage from "../../components/patterns/ListPage";
import PageHeader from "../../components/patterns/PageHeader";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import Card from "../../components/primitives/Card";
import ComponentRow from "../../components/domain/ComponentRow";
import { componentTypes, type ProjectComponentItem, type ProjectComponentType } from "../../model/component-types";
import EmptyState from "../../components/primitives/EmptyState";
import ListGroup from "../../components/primitives/ListGroup";

/** What the Components page lists: the project's components besides its workflows, and the kinds it shows. */
export interface ProjectComponentsPageData {
  projectId: string;
  components: ProjectComponentItem[];
  /** The kinds of component the page lists and offers to add, never Workflow (it has its own page). */
  types: ProjectComponentType[];
}

export interface ProjectComponentsPageProps extends PageProps<ProjectComponentsPageData> {
  /** Makes a channel, as Lightning's Channels page does. Left out where you can't. */
  onCreateChannel?: (draft: ChannelDraft) => Promise<void>;
  /** Makes a collection with a URL-safe name. Left out where you can't. */
  onCreateCollection?: (name: string) => Promise<void>;
  /** Makes a form, artifact, AI skill, document or static website, which then opens. Left out where you can't. */
  onCreateComponent?: (type: ContentComponentType, draft: ComponentDraft) => Promise<void>;
  /** Hands a kind of component to AI to draft from a plain-words description instead. Left out without Build with AI. */
  onDraftWithAI?: (type: ProjectComponentType) => void;
  /** The project's credentials, by name, that a new channel can sign in with. */
  channelCredentials?: string[];
  /** Where an event channel with a given name would listen. */
  channelAddress?: (name: string) => string;
}

/**
 * Every component in the project, grouped by type, under a panel for adding
 * a new one: picking a kind opens its form (a channel's, a collection's
 * name, or a name and description for the rest), and the new component
 * opens. Workflows have their own page, so they are left out here, as are
 * empty groups. Lists only the kinds in `data.types`: with just channels,
 * it's the project's Channels page, with a New channel button.
 */
export default function ProjectComponentsPage({
  node,
  ancestors,
  data,
  onCreateChannel,
  onCreateCollection,
  onCreateComponent,
  onDraftWithAI,
  channelCredentials = [],
  channelAddress = (name) => name,
}: ProjectComponentsPageProps) {
  const [creating, setCreating] = useState<ProjectComponentType>();
  const [created, setCreated] = useState<string>();
  const projectPath = `/projects/${data.projectId}`;
  const types = componentTypes.filter((t) => t.type !== "Workflow" && data.types.includes(t.type));
  const groups = types
    .map((t) => ({ ...t, items: data.components.filter((c) => c.type === t.type) }))
    .filter((g) => g.items.length > 0);
  const canCreate = (type: ProjectComponentType) =>
    type === "Channel" ? !!onCreateChannel : type === "Collection" ? !!onCreateCollection : isContentComponentType(type) && !!onCreateComponent;
  const creatable = types.filter((t) => canCreate(t.type));
  // With more than channels, the panel offers every kind; with just channels, a button does.
  const showPanel = types.length > 1 && creatable.length > 0;
  const takenNames = (type: ProjectComponentType) => data.components.filter((c) => c.type === type).map((c) => c.name);

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const noun = types.length === 1 ? (total === 1 ? types[0]!.type : types[0]!.plural) : total === 1 ? "component" : "components";

  return (
    <>
      <ListPage
        header={
          <PageHeader
            breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
            title={node.label}
            description={node.description}
            actions={
              onCreateChannel &&
              !showPanel && (
                <Button icon={Plus} size="sm" onClick={() => setCreating("Channel")}>
                  New channel
                </Button>
              )
            }
          />
        }
        notice={created && <Callout variant="success" title={`Created ${created}.`} />}
        intro={showPanel && <AddComponentPanel options={creatable} onSelect={(type) => setCreating(type as ProjectComponentType)} />}
        summary={total > 0 && `${total} ${noun.toLowerCase()}`}
        isEmpty={groups.length === 0}
        empty={
          <EmptyState
            icon={Boxes}
            title={`No ${node.label.toLowerCase()} yet`}
            description={
              types.length > 1
                ? `Components are the building blocks of a project: ${types.map((t) => t.plural.toLowerCase()).join(", ")}.${showPanel ? " Add one above." : ""}`
                : undefined
            }
          />
        }
      >
        <Stack gap="xl">
          {groups.map((group) => (
            <ListGroup key={group.type} title={group.plural} count={group.items.length} description={group.description}>
              <Card flush className="space-y-0.5 p-1.5">
                {group.items.map((c) => (
                  <ComponentRow key={c.id} component={c} projectPath={projectPath} showDescription hideType />
                ))}
              </Card>
            </ListGroup>
          ))}
        </Stack>
      </ListPage>

      {onCreateChannel && (
        <ChannelFormModal
          open={creating === "Channel"}
          takenNames={takenNames("Channel")}
          credentials={channelCredentials}
          eventAddress={channelAddress}
          onClose={() => setCreating(undefined)}
          onSubmit={async (draft) => {
            await onCreateChannel(draft);
            setCreated(draft.name.trim());
          }}
        />
      )}
      {onCreateCollection && (
        <CollectionNameModal
          open={creating === "Collection"}
          takenNames={takenNames("Collection")}
          onClose={() => setCreating(undefined)}
          onSave={async (name) => {
            await onCreateCollection(name);
            setCreated(name);
          }}
        />
      )}
      {onCreateComponent && creating && isContentComponentType(creating) && (
        <ComponentFormModal
          open
          type={creating}
          takenNames={takenNames(creating)}
          onClose={() => setCreating(undefined)}
          onSubmit={async (draft) => {
            await onCreateComponent(creating, draft);
            setCreated(draft.name.trim());
          }}
          onDraftWithAI={onDraftWithAI ? () => onDraftWithAI(creating) : undefined}
        />
      )}
    </>
  );
}

