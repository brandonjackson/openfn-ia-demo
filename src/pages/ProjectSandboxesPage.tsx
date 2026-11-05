import { useState } from "react";
import { Check, FlaskConical, Plus, Trash2 } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { ProjectSandboxesPageData, SandboxItem } from "../model/page-data";
import Badge from "../components/primitives/Badge";
import PageHeader from "../components/patterns/PageHeader";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import Button from "../components/primitives/Button";
import ConfirmModal from "../components/primitives/ConfirmModal";
import EmptyState from "../components/primitives/EmptyState";
import ListRow from "../components/primitives/ListRow";
import SectionHeading from "../components/primitives/SectionHeading";

export interface ProjectSandboxesPageProps extends PageProps<ProjectSandboxesPageData> {
  /** The sandbox you're working in, shared with the rest of the project. */
  selectedSandbox: string;
  /** Switches to another sandbox. */
  onSelectSandbox: (name: string) => void;
  /** Deletes a sandbox (never main, never the selected one). */
  onDeleteSandbox: (name: string) => Promise<void>;
}

function SandboxRow({
  sandbox,
  selected,
  onSelect,
  onDelete,
}: {
  sandbox: SandboxItem;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}) {
  return (
    <ListRow
      icon={FlaskConical}
      title={sandbox.name}
      monoTitle
      selected={selected}
      onClick={onSelect}
      actions={
        onDelete && (
          <Button variant="outline-danger" size="xs" icon={Trash2} onClick={onDelete}>
            Delete
          </Button>
        )
      }
      badges={
        <>
          {selected && <Badge label="Selected" tone="indigo" icon={Check} />}
          {sandbox.isMain && <Badge label="Main" />}
        </>
      }
      description={
        sandbox.description || <span className="italic text-gray-400">No description</span>
      }
      meta={
        <>
          <span>Created by {sandbox.createdBy}</span>
          <span>
            {sandbox.lastActivity === "Never" ? "No activity yet" : `Active ${sandbox.lastActivity}`}
          </span>
        </>
      }
    />
  );
}

/**
 * A project's sandboxes. The one you're working in sits on its own at the
 * top; the rest are listed below, and picking one switches to it. Listed
 * sandboxes other than main can be deleted; the selected one can't.
 */
export default function ProjectSandboxesPage({
  node,
  ancestors,
  data,
  selectedSandbox: selectedName,
  onSelectSandbox: setSelected,
  onDeleteSandbox,
}: ProjectSandboxesPageProps) {
  const [pendingDelete, setPendingDelete] = useState<SandboxItem | null>(null);
  const sandboxes = data.sandboxes;
  const main = sandboxes.find((s) => s.isMain);
  const selected =
    sandboxes.find((s) => s.name === selectedName) ?? main ?? sandboxes[0];
  const others = sandboxes.filter((s) => s !== selected);

  const confirmDelete = () => {
    if (pendingDelete) void onDeleteSandbox(pendingDelete.name);
    setPendingDelete(null);
  };
  const deleteHandler = (sandbox: SandboxItem) =>
    sandbox.isMain ? undefined : () => setPendingDelete(sandbox);

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
        title={node.label}
        description={node.description}
        actions={
          <Button icon={Plus} size="sm">
            New sandbox
          </Button>
        }
      />

      {selected && (
        <section>
          <SectionHeading title="Selected" variant="label" />
          <SandboxRow sandbox={selected} selected />
        </section>
      )}

      <section>
        <SectionHeading title="Active" variant="label" />
        {others.length > 0 ? (
          <div className="space-y-2">
            {others.map((sandbox) => (
              <SandboxRow
                key={sandbox.name}
                sandbox={sandbox}
                onSelect={() => setSelected(sandbox.name)}
                onDelete={deleteHandler(sandbox)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FlaskConical}
            title="No other sandboxes"
            description="Create a sandbox to try out changes without touching main."
          />
        )}
      </section>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete sandbox"
        confirmLabel="Delete sandbox"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      >
        <p>
          Delete <code className="font-mono text-gray-900">{pendingDelete?.name}</code>? Its changes
          that haven't been merged into main will be lost. This can't be undone.
        </p>
      </ConfirmModal>
    </div>
  );
}
