import { Check, FlaskConical, Plus } from "lucide-react";
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
}: {
  sandbox: SandboxItem;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <ListRow
      icon={FlaskConical}
      title={sandbox.name}
      monoTitle
      selected={selected}
      onClick={onSelect}
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
 * top; the rest are listed below, and picking one switches to it.
 */
export default function ProjectSandboxesTemplate({ node, ancestors, data }: Props) {
  const [selectedName, setSelected] = useSandbox(data.projectId);
  const selected =
    data.sandboxes.find((s) => s.name === selectedName) ??
    data.sandboxes.find((s) => s.isMain) ??
    data.sandboxes[0];
  const others = data.sandboxes.filter((s) => s !== selected);

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
