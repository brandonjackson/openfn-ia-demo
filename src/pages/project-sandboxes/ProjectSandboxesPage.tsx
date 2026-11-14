import { useState } from "react";
import { FlaskConical, GitMerge, Pencil, Plus, Trash2 } from "lucide-react";
import type { PageProps } from "../../model/ia-tree";
import { sandboxIcon, type SandboxDraft, type SandboxItem } from "../../model/sandboxes";
import { ENVIRONMENTS, environmentLabels, type Environment } from "../../model/credentials";
import { timeAgo } from "../../model/time";
import ListPage from "../../components/patterns/ListPage";
import PageHeader from "../../components/patterns/PageHeader";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import SandboxFormModal from "../../components/domain/SandboxFormModal";
import PromoteSandboxModal from "../../components/domain/PromoteSandboxModal";
import Button from "../../components/primitives/Button";
import ConfirmModal from "../../components/primitives/ConfirmModal";
import CountBadge from "../../components/primitives/CountBadge";
import EmptyState from "../../components/primitives/EmptyState";
import ListRow from "../../components/primitives/ListRow";
import ListGroup from "../../components/primitives/ListGroup";
import Stack from "../../components/primitives/Stack";
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
  /** Renames a sandbox or changes its environment (never main). Left out where you can't. */
  onEditSandbox?: (name: string, draft: SandboxDraft) => Promise<void>;
  /**
   * Promotes a sandbox's changes into its parent, with what was said about
   * them, as the editor's promotion request does. Left out where you can't.
   */
  onPromoteSandbox?: (name: string, message: string) => Promise<void>;
  /** Deletes a sandbox (never main, never the selected one). The wrapper says how it went, refusals included. */
  onDeleteSandbox: (name: string) => Promise<void>;
}

type RowAction = "edit" | "promote" | "delete";

/** "Production", or the stored name as it is when it's none the forms offer. */
const envLabel = (env: string) => ((ENVIRONMENTS as string[]).includes(env) ? environmentLabels[env as Environment] : env);

function SandboxRow({
  sandbox,
  selected,
  actions,
  onSwitch,
  onAction,
}: {
  sandbox: SandboxItem;
  /** The sandbox you're in: tinted, blue for main and amber for a sandbox, as the editor marks them. */
  selected?: boolean;
  /** What the row's menu offers. */
  actions: RowAction[];
  onSwitch?: () => void;
  onAction: (action: RowAction) => void;
}) {
  const changed = sandbox.changes.length;
  return (
    <ListRow
      icon={sandboxIcon(sandbox.isMain)}
      title={sandbox.name}
      monoTitle
      selected={selected}
      selectedTone={sandbox.isMain ? "indigo" : "amber"}
      onClick={onSwitch}
      badges={changed > 0 && <CountBadge count={changed} tone="amber" label={changed === 1 ? "change" : "changes"} />}
      meta={
        <>
          <span>{envLabel(sandbox.env)}</span>
          <span>{sandbox.parent ? `Made from ${sandbox.parent} by ${sandbox.createdBy}` : `Created by ${sandbox.createdBy}`}</span>
          <span>{sandbox.lastActivity ? `Active ${timeAgo(sandbox.lastActivity)}` : "No activity yet"}</span>
        </>
      }
      actions={
        onSwitch && (
          <Button variant="secondary" size="xs" onClick={onSwitch} aria-label={`Switch to ${sandbox.name}`}>
            Switch
          </Button>
        )
      }
      menu={{
        items: [
          ...(actions.includes("edit") ? [{ id: "edit", label: "Edit", icon: Pencil }] : []),
          ...(actions.includes("promote") ? [{ id: "promote", label: "Promote", icon: GitMerge }] : []),
          ...(actions.includes("delete") ? [{ id: "delete", label: "Delete", icon: Trash2, tone: "danger" as const, divider: actions.length > 1 }] : []),
        ],
        onSelect: (id) => onAction(id as RowAction),
      }}
    />
  );
}

/**
 * A project's sandboxes. The one you're working in sits on its own at the
 * top, tinted as the editor marks it; the rest are listed below, each with
 * Switch, and a count of what it changes where it has changes. As in
 * Lightning, a sandbox can be made from another, renamed or moved to another
 * environment, promoted into its parent, and deleted, except main and the
 * one you're in. Making and editing one use the same form as the editor, and
 * Promote opens the editor's promotion request.
 */
export default function ProjectSandboxesPage({
  node,
  ancestors,
  data,
  selectedSandbox: selectedName,
  onSelectSandbox: setSelected,
  onCreateSandbox,
  onEditSandbox,
  onPromoteSandbox,
  onDeleteSandbox,
}: ProjectSandboxesPageProps) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SandboxItem>();
  const [promoting, setPromoting] = useState<SandboxItem>();
  const [pendingDelete, setPendingDelete] = useState<SandboxItem | null>(null);
  const sandboxes = data.sandboxes;
  const names = sandboxes.map((s) => s.name);
  const main = sandboxes.find((s) => s.isMain);
  const selected = sandboxes.find((s) => s.name === selectedName) ?? main ?? sandboxes[0];
  const others = sandboxes.filter((s) => s !== selected);

  const actionsFor = (sandbox: SandboxItem): RowAction[] =>
    sandbox.isMain
      ? []
      : [
          ...(onEditSandbox ? (["edit"] as const) : []),
          ...(onPromoteSandbox && sandbox.parent && sandbox.changes.length > 0 ? (["promote"] as const) : []),
          ...(sandbox !== selected ? (["delete"] as const) : []),
        ];
  const act = (sandbox: SandboxItem) => (action: RowAction) =>
    action === "edit" ? setEditing(sandbox) : action === "promote" ? setPromoting(sandbox) : setPendingDelete(sandbox);

  const confirmDelete = async () => {
    const name = pendingDelete?.name;
    setPendingDelete(null);
    if (name) {
      // The wrapper says how it went.
      await onDeleteSandbox(name).catch(() => {});
    }
  };

  return (
    <>
      <ListPage
        header={
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
        }
      >
        <Stack gap="xl">
          {selected && (
            <ListGroup title="Selected">
              <SandboxRow sandbox={selected} selected actions={actionsFor(selected)} onAction={act(selected)} />
            </ListGroup>
          )}

          <ListGroup title="Active" count={others.length}>
            {others.length > 0 ? (
              others.map((sandbox) => (
                <SandboxRow
                  key={sandbox.name}
                  sandbox={sandbox}
                  actions={actionsFor(sandbox)}
                  onSwitch={() => setSelected(sandbox.name)}
                  onAction={act(sandbox)}
                />
              ))
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
          </ListGroup>
        </Stack>
      </ListPage>

      {onCreateSandbox && (
        <SandboxFormModal
          open={creating}
          sandboxes={names}
          defaultParent={selected?.name}
          onClose={() => setCreating(false)}
          onSubmit={onCreateSandbox}
        />
      )}
      {onEditSandbox && (
        <SandboxFormModal
          open={!!editing}
          sandbox={editing}
          sandboxes={names}
          onClose={() => setEditing(undefined)}
          onSubmit={(draft) => onEditSandbox(editing!.name, draft)}
        />
      )}
      {onPromoteSandbox && (
        <PromoteSandboxModal
          open={!!promoting}
          sandbox={promoting?.name ?? ""}
          target={promoting?.parent}
          changes={promoting?.changes ?? []}
          onClose={() => setPromoting(undefined)}
          onPromote={(message) => onPromoteSandbox(promoting!.name, message)}
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
          {`Delete ${pendingDelete?.name}? Its changes that haven't been promoted will be lost, along with any sandbox made from it. This can't be undone.`}
        </Text>
      </ConfirmModal>
    </>
  );
}
