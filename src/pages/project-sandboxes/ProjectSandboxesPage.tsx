import { useState } from "react";
import { Check, FlaskConical, GitMerge, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { PageProps } from "../../model/ia-tree";
import type { SandboxDraft, SandboxItem, SandboxMerge } from "../../model/sandboxes";
import { timeAgo } from "../../model/time";
import { errorMessageOf } from "../../model/form-error";
import Badge from "../../components/primitives/Badge";
import PageHeader from "../../components/patterns/PageHeader";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import SandboxFormModal from "../../components/domain/SandboxFormModal";
import MergeSandboxModal from "../../components/domain/MergeSandboxModal";
import Button from "../../components/primitives/Button";
import Callout from "../../components/primitives/Callout";
import ConfirmModal from "../../components/primitives/ConfirmModal";
import DropdownMenu from "../../components/primitives/DropdownMenu";
import EmptyState from "../../components/primitives/EmptyState";
import IconButton from "../../components/primitives/IconButton";
import ListRow from "../../components/primitives/ListRow";
import SectionHeading from "../../components/primitives/SectionHeading";
import Stack from "../../components/primitives/Stack";
import Swatch from "../../components/primitives/Swatch";
import Text from "../../components/primitives/Text";

/** What the Sandboxes page shows. */
export interface ProjectSandboxesPageData {
  /** Main first, then each sandbox, with what it has changed. */
  sandboxes: SandboxItem[];
}

export interface ProjectSandboxesPageProps extends PageProps<ProjectSandboxesPageData> {
  /** The sandbox you're working in, shared with the rest of the project. */
  selectedSandbox: string;
  /** Switches to another sandbox. */
  onSelectSandbox: (name: string) => void;
  /** Makes a sandbox from another, named the slug of the name typed. Left out where you can't make sandboxes. */
  onCreateSandbox?: (draft: SandboxDraft) => Promise<void>;
  /** Renames or recolours a sandbox (never main). */
  onEditSandbox?: (name: string, draft: SandboxDraft) => Promise<void>;
  /** Brings a sandbox's changed workflows and credentials into another sandbox. */
  onMergeSandbox?: (name: string, merge: SandboxMerge) => Promise<void>;
  /** Deletes a sandbox (never main, never the selected one). */
  onDeleteSandbox: (name: string) => Promise<void>;
}

type RowAction = "edit" | "merge" | "delete";

function SandboxRow({
  sandbox,
  selected,
  actions,
  onSelect,
  onAction,
}: {
  sandbox: SandboxItem;
  selected?: boolean;
  /** What the row's menu offers. */
  actions: RowAction[];
  onSelect?: () => void;
  onAction: (action: RowAction) => void;
}) {
  const changed = sandbox.changes.length;
  return (
    <ListRow
      icon={FlaskConical}
      logo={<Swatch tone={sandbox.color} size="tile" icon={FlaskConical} />}
      title={sandbox.name}
      monoTitle
      selected={selected}
      onClick={onSelect}
      actions={
        actions.length > 0 && (
          <DropdownMenu
            ariaLabel={`Actions for ${sandbox.name}`}
            align="right"
            widthClass="w-44"
            items={[
              ...(actions.includes("edit") ? [{ id: "edit", label: "Edit", icon: Pencil }] : []),
              ...(actions.includes("merge") ? [{ id: "merge", label: "Merge", icon: GitMerge }] : []),
              ...(actions.includes("delete") ? [{ id: "delete", label: "Delete", icon: Trash2, tone: "danger" as const, divider: actions.length > 1 }] : []),
            ]}
            onSelect={(id) => onAction(id as RowAction)}
            trigger={({ toggle }) => <IconButton icon={MoreVertical} label={`Actions for ${sandbox.name}`} onClick={toggle} />}
          />
        )
      }
      badges={
        <>
          {selected && <Badge label="Selected" tone="indigo" icon={Check} />}
          {sandbox.isMain && <Badge label="Main" />}
          {changed > 0 && <Badge label={`${changed} changed workflow${changed === 1 ? "" : "s"}`} tone="gray" />}
        </>
      }
      description={sandbox.description || <Text tone="subtle">No description</Text>}
      meta={
        <>
          <span>{sandbox.parent ? `Made from ${sandbox.parent} by ${sandbox.createdBy}` : `Created by ${sandbox.createdBy}`}</span>
          <span>{sandbox.lastActivity ? `Active ${timeAgo(sandbox.lastActivity)}` : "No activity yet"}</span>
        </>
      }
    />
  );
}

/** The sandboxes made from `name`, and the ones made from those, which it can't merge into. */
function descendants(name: string, sandboxes: SandboxItem[]): string[] {
  const children = sandboxes.filter((s) => s.parent === name).map((s) => s.name);
  return [...children, ...children.flatMap((c) => descendants(c, sandboxes))];
}

/**
 * A project's sandboxes. The one you're working in sits on its own at the
 * top; the rest are listed below, and picking one switches to it. As in
 * Lightning, a sandbox can be made from another, renamed and recoloured,
 * merged back (or into another), and deleted, except main and the one
 * you're in.
 */
export default function ProjectSandboxesPage({
  node,
  ancestors,
  data,
  selectedSandbox: selectedName,
  onSelectSandbox: setSelected,
  onCreateSandbox,
  onEditSandbox,
  onMergeSandbox,
  onDeleteSandbox,
}: ProjectSandboxesPageProps) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SandboxItem>();
  const [merging, setMerging] = useState<SandboxItem>();
  const [pendingDelete, setPendingDelete] = useState<SandboxItem | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; title: string; detail?: string }>();
  const sandboxes = data.sandboxes;
  const main = sandboxes.find((s) => s.isMain);
  const selected = sandboxes.find((s) => s.name === selectedName) ?? main ?? sandboxes[0];
  const others = sandboxes.filter((s) => s !== selected);

  const actionsFor = (sandbox: SandboxItem): RowAction[] =>
    sandbox.isMain
      ? []
      : [
          ...(onEditSandbox ? (["edit"] as const) : []),
          ...(onMergeSandbox ? (["merge"] as const) : []),
          ...(sandbox !== selected ? (["delete"] as const) : []),
        ];
  const act = (sandbox: SandboxItem) => (action: RowAction) =>
    action === "edit" ? setEditing(sandbox) : action === "merge" ? setMerging(sandbox) : setPendingDelete(sandbox);

  const confirmDelete = async () => {
    const name = pendingDelete?.name;
    setPendingDelete(null);
    if (name) {
      try {
        await onDeleteSandbox(name);
        setNotice({ tone: "success", title: `Deleted ${name}.` });
      } catch (error) {
        setNotice({ tone: "danger", title: `${name} wasn't deleted`, detail: errorMessageOf(error) });
      }
    }
  };

  const mergeTargets = merging
    ? [
        ...(merging.parent ? [merging.parent] : []),
        ...sandboxes
          .map((s) => s.name)
          .filter((n) => n !== merging.name && n !== merging.parent && !descendants(merging.name, sandboxes).includes(n)),
      ]
    : [];

  return (
    <Stack gap="xl">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
        title={node.label}
        description={node.description}
        actions={
          onCreateSandbox && (
            <Button icon={Plus} size="sm" onClick={() => setCreating(true)}>
              New sandbox
            </Button>
          )
        }
      />

      {notice && (
        <Callout variant={notice.tone} title={notice.title} role={notice.tone === "danger" ? "alert" : undefined}>
          {notice.detail}
        </Callout>
      )}

      {selected && (
        <section>
          <SectionHeading title="Selected" variant="label" />
          <SandboxRow sandbox={selected} selected actions={actionsFor(selected)} onAction={act(selected)} />
        </section>
      )}

      <section>
        <SectionHeading title="Active" variant="label" />
        {others.length > 0 ? (
          <Stack gap="sm">
            {others.map((sandbox) => (
              <SandboxRow
                key={sandbox.name}
                sandbox={sandbox}
                actions={actionsFor(sandbox)}
                onSelect={() => setSelected(sandbox.name)}
                onAction={act(sandbox)}
              />
            ))}
          </Stack>
        ) : (
          <EmptyState
            icon={FlaskConical}
            title="No other sandboxes"
            description="Create a sandbox to try out changes without touching main."
            action={
              onCreateSandbox && (
                <Button icon={Plus} size="sm" variant="secondary" onClick={() => setCreating(true)}>
                  New sandbox
                </Button>
              )
            }
          />
        )}
      </section>

      {onCreateSandbox && (
        <SandboxFormModal
          open={creating}
          sandboxes={sandboxes}
          defaultParent={selected?.name}
          onClose={() => setCreating(false)}
          onSubmit={async (draft) => {
            await onCreateSandbox(draft);
            setNotice({ tone: "success", title: `Created a sandbox from ${draft.parent}.` });
          }}
        />
      )}
      {onEditSandbox && (
        <SandboxFormModal
          open={!!editing}
          sandbox={editing}
          sandboxes={sandboxes}
          onClose={() => setEditing(undefined)}
          onSubmit={(draft) => onEditSandbox(editing!.name, draft)}
        />
      )}
      {onMergeSandbox && (
        <MergeSandboxModal
          sandbox={merging}
          targets={mergeTargets}
          onClose={() => setMerging(undefined)}
          onMerge={async (merge) => {
            await onMergeSandbox(merging!.name, merge);
            setNotice({ tone: "success", title: `Merged ${merging!.name} into ${merge.target}. You can delete the sandbox once you're done with it.` });
          }}
        />
      )}

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete sandbox"
        confirmLabel="Delete sandbox"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      >
        <Text block>
          {`Delete ${pendingDelete?.name}? Its changes that haven't been merged will be lost, along with any sandbox made from it. This can't be undone.`}
        </Text>
      </ConfirmModal>
    </Stack>
  );
}
