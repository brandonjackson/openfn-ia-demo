import { useNavigate } from "react-router-dom";
import { Boxes } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { ProjectComponentsPageData } from "../model/page-data";
import AddComponentPanel from "../components/patterns/AddComponentPanel";
import PageHeader from "../components/patterns/PageHeader";
import Card from "../components/primitives/Card";
import ComponentRow from "../components/domain/ComponentRow";
import { componentTypes } from "../model/component-types";
import EmptyState from "../components/primitives/EmptyState";
import SectionHeading from "../components/primitives/SectionHeading";

export type ProjectComponentsPageProps = PageProps<ProjectComponentsPageData>;

/**
 * Every component in the project, grouped by type, under a panel for adding
 * a new one. Workflows have their own page, so they are left out here, as
 * are empty groups.
 */
export default function ProjectComponentsPage({ node, ancestors, data }: ProjectComponentsPageProps) {
  const navigate = useNavigate();
  const projectPath = `/projects/${data.projectId}`;
  const types = componentTypes.filter((t) => t.type !== "Workflow");
  const groups = types
    .map((t) => ({ ...t, items: data.components.filter((c) => c.type === t.type) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={{
          ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
          current: node.label,
        }}
        title={node.label}
        description={node.description}
      />

      <div>
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
