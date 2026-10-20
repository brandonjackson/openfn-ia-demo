import { useState } from "react";
import { Check, FlaskConical, Plus, Trash2 } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ProjectSandboxesPageData, SandboxItem } from "../page-data";
import { useSandbox } from "../sandbox-state";
import Badge from "../components/Badge";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ListRow from "../components/ListRow";
import SectionHeading from "../components/SectionHeading";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: ProjectSandboxesPageData;
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
          {selected && <Badge label="Selected" tone="blue" icon={Check} />}
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
export default function ProjectSandboxesTemplate({ node, ancestors, data }: Props) {
  const [selectedName, setSelected] = useSandbox(data.projectId);
  const [deleted, setDeleted] = useState<string[]>([]);
  const sandboxes = data.sandboxes.filter((s) => !deleted.includes(s.name));
  const main = sandboxes.find((s) => s.isMain);
  const selected =
    sandboxes.find((s) => s.name === selectedName) ?? main ?? sandboxes[0];
  const others = sandboxes.filter((s) => s !== selected);

  const remove = (sandbox: SandboxItem) => {
    if (!window.confirm(`Delete sandbox "${sandbox.name}"? This can't be undone.`)) return;
    setDeleted((d) => [...d, sandbox.name]);
  };
  const deleteHandler = (sandbox: SandboxItem) =>
    sandbox.isMain ? undefined : () => remove(sandbox);

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={{
          ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
          current: node.label,
        }}
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
    </div>
  );
}
