import { useRef, useState } from "react";
import { ArrowLeftRight, MoreVertical, Pencil, Power, Trash2, Workflow } from "lucide-react";
import type { ChannelDraft } from "../../model/channels";
import ChannelFormModal from "../../components/domain/ChannelFormModal";
import Callout from "../../components/primitives/Callout";
import ConfirmModal from "../../components/primitives/ConfirmModal";
import DropdownMenu from "../../components/primitives/DropdownMenu";
import IconButton from "../../components/primitives/IconButton";
import Inline from "../../components/primitives/Inline";
import Stack from "../../components/primitives/Stack";
import type { PageProps } from "../../model/ia-tree";
import { errorMessageOf } from "../../model/form-error";
import { channelTypeConfig } from "../../components/domain/channel-types";
import PageHeader from "../../components/patterns/PageHeader";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import Badge from "../../components/primitives/Badge";
import Button from "../../components/primitives/Button";
import ChannelView from "../../components/domain/ChannelView";
import type { ProjectComponentItem } from "../../model/component-types";
import type { ChannelDetails } from "../../model/channels";

/** A channel's page in its project, opened from the project's Components. */
export interface ChannelPageData {
  projectId: string;
  projectName: string;
  component: ProjectComponentItem;
  channel: ChannelDetails;
}

export interface ChannelPageProps extends PageProps<ChannelPageData> {
  /** Opens the workflow whose runs the channel's messages started or came from, when there is one. */
  onOpenWorkflow?: () => void;
  /** Opens that workflow with a run loaded, from one of the channel's messages. */
  onOpenRun?: (runId: string) => void;
  /** Saves changes to the channel's name, system, destination, credential or whether it's on. Left out where you can't edit it. */
  onEditChannel?: (draft: ChannelDraft) => Promise<void>;
  /** Turns the channel on or off; off, it refuses every request. */
  onSetEnabled?: (enabled: boolean) => Promise<void>;
  /** Deletes the channel. */
  onDeleteChannel?: () => Promise<void>;
  /** What an edit starts from. */
  draft?: ChannelDraft;
  /** Names used by the project's other channels. */
  takenNames?: string[];
  /** The project's credentials, by name. */
  credentials?: string[];
}

/**
 * A channel's page in its project, opened from the project's Components: the
 * same `ChannelView` the workflow editor shows when the channel is opened from
 * its code explorer, under the page's header. Loading a run from a message
 * opens the workflow editor with that run loaded.
 */
export default function ChannelPage({
  ancestors,
  data,
  onOpenWorkflow,
  onOpenRun,
  onEditChannel,
  onSetEnabled,
  onDeleteChannel,
  draft,
  takenNames = [],
  credentials = [],
}: ChannelPageProps) {
  const { component, channel } = data;
  const type = channelTypeConfig[channel.channelType];
  const enabled = channel.enabled ?? true;
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refusal, setRefusal] = useState<{ title: string; detail: string }>();
  const pending = useRef(false);
  /** Runs a menu action, saying why if the server refuses it; a second press while one runs is ignored. */
  const attempt = async (title: string, action: () => Promise<void>) => {
    if (pending.current) return;
    pending.current = true;
    setRefusal(undefined);
    try {
      await action();
    } catch (error) {
      setRefusal({ title, detail: errorMessageOf(error) });
    } finally {
      pending.current = false;
    }
  };
  const menu = [
    ...(onEditChannel ? [{ id: "edit", label: "Edit", icon: Pencil }] : []),
    ...(onSetEnabled ? [{ id: "toggle", label: enabled ? "Turn off" : "Turn on", icon: Power }] : []),
    ...(onDeleteChannel ? [{ id: "delete", label: "Delete", icon: Trash2, tone: "danger" as const, divider: true }] : []),
  ];

  return (
    <Stack gap="xl">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={component.name} />}
        icon={ArrowLeftRight}
        title={component.name}
        badges={
          <>
            <Badge label={type.label} tone={type.tone} icon={type.icon} />
            {!enabled && <Badge label="Off" tone="gray" icon={Power} />}
          </>
        }
        description={component.description}
        actions={
          <Inline>
            {onOpenWorkflow && (
              <Button icon={Workflow} size="sm" variant="secondary" onClick={onOpenWorkflow}>
                Open workflow
              </Button>
            )}
            {menu.length > 0 && (
              <DropdownMenu
                ariaLabel={`Actions for ${component.name}`}
                align="right"
                widthClass="w-44"
                items={menu}
                onSelect={(id) =>
                  id === "edit"
                    ? setEditing(true)
                    : id === "delete"
                      ? setDeleting(true)
                      : onSetEnabled && void attempt(`The channel wasn't turned ${enabled ? "off" : "on"}`, () => onSetEnabled(!enabled))
                }
                trigger={({ toggle }) => <IconButton icon={MoreVertical} label={`Actions for ${component.name}`} onClick={toggle} />}
              />
            )}
          </Inline>
        }
      />
      {refusal && (
        <Callout variant="danger" title={refusal.title} role="alert">
          {refusal.detail}
        </Callout>
      )}
      {!enabled && (
        <Callout variant="warning" title="This channel is off">
          It refuses every request until it's turned back on.
        </Callout>
      )}
      <ChannelView
        variant="page"
        name={component.name}
        description={component.description}
        channel={channel}
        onOpenRun={onOpenRun}
      />

      {onEditChannel && (
        <ChannelFormModal
          open={editing}
          initial={draft}
          takenNames={takenNames}
          credentials={credentials}
          eventAddress={() => channel.endpoint}
          onClose={() => setEditing(false)}
          onSubmit={onEditChannel}
        />
      )}
      {onDeleteChannel && (
        <ConfirmModal
          open={deleting}
          title={`Delete ${component.name}?`}
          confirmLabel="Delete channel"
          onClose={() => setDeleting(false)}
          onConfirm={() => {
            setDeleting(false);
            void attempt("The channel wasn't deleted", onDeleteChannel);
          }}
        >
          Requests to it stop being forwarded straight away, and its address stops working. Workflows that call it will fail at that step.
        </ConfirmModal>
      )}
    </Stack>
  );
}
