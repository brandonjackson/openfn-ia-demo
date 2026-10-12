import { Boxes, Plus } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ProjectComponentsPageData } from "../page-data";
import Breadcrumbs from "../components/Breadcrumbs";
import Button from "../components/Button";
import Card from "../components/Card";
import ComponentRow from "../components/ComponentRow";
import { componentTypes } from "../component-types";
import EmptyState from "../components/EmptyState";
import SectionHeading from "../components/SectionHeading";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: ProjectComponentsPageData;
}

/**
 * Every component in the project, grouped by type: channels, forms,
 * artifacts and collections. Workflows have their own page, so they are
 * left out here, as are empty groups.
 */
export default function ProjectComponentsTemplate({ node, ancestors, data }: Props) {
  const projectPath = `/projects/${data.projectId}`;
  const groups = componentTypes
    .filter((t) => t.type !== "Workflow")
    .map((t) => ({ ...t, items: data.components.filter((c) => c.type === t.type) }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <Breadcrumbs
        ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))}
        current={node.label}
      />

      <div className="mt-6 mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
          {node.description && <p className="mt-1 text-sm text-gray-500">{node.description}</p>}
        </div>
        <Button icon={Plus} size="sm">
          New Component
        </Button>
      </div>

      {groups.length > 0 ? (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.type}>
              <SectionHeading
                title={`${group.plural} (${group.items.length})`}
                description={group.description}
              />
              <Card flush className="-mt-3">
                {group.items.map((c) => (
                  <ComponentRow key={c.id} component={c} projectPath={projectPath} showDescription hideType />
                ))}
              </Card>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Boxes}
          title="No components yet"
          description="Components are the building blocks of a project: channels, forms, artifacts and collections."
        />
      )}
    </div>
  );
}
