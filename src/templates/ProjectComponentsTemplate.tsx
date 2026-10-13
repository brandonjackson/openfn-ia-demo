import { useNavigate } from "react-router-dom";
import { Boxes } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ProjectComponentsPageData } from "../page-data";
import AddComponentPanel from "../components/AddComponentPanel";
import Breadcrumbs from "../components/Breadcrumbs";
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
 * Every component in the project, grouped by type, under a panel for adding
 * a new one. Workflows have their own page, so they are left out here, as
 * are empty groups.
 */
export default function ProjectComponentsTemplate({ node, ancestors, data }: Props) {
  const navigate = useNavigate();
  const projectPath = `/projects/${data.projectId}`;
  const types = componentTypes.filter((t) => t.type !== "Workflow");
  const groups = types
    .map((t) => ({ ...t, items: data.components.filter((c) => c.type === t.type) }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <Breadcrumbs
        ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))}
        current={node.label}
      />

      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{node.label}</h1>
        {node.description && <p className="mt-1 text-sm text-gray-500">{node.description}</p>}
      </div>

      <div className="mb-8">
        <AddComponentPanel
          options={types}
          // Components are drafted from a plain-words description on Create.
          onSelect={(type) =>
            navigate(`${projectPath}/create`, {
              state: { draft: `Add ${/^[aeiou]/i.test(type) ? "an" : "a"} ${type.toLowerCase()} to this project that ` },
            })
          }
        />
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
          description="Components are the building blocks of a project: channels, forms, documents, AI skills and more. Add one above."
        />
      )}
    </div>
  );
}
