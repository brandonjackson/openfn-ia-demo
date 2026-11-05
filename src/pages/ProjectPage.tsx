import { useState } from "react";
import { ClipboardList } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { ProjectPageData } from "../model/page-data";
import Badge from "../components/primitives/Badge";
import PageHeader from "../components/patterns/PageHeader";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import BuildPrompt from "../components/domain/BuildPrompt";
import Card from "../components/primitives/Card";
import ComponentRow from "../components/domain/ComponentRow";
import EmptyState from "../components/primitives/EmptyState";
import IdeaCard from "../components/domain/IdeaCard";
import ListRow from "../components/primitives/ListRow";
import SectionHeading from "../components/primitives/SectionHeading";
import StatTile from "../components/primitives/StatTile";
import TextLink from "../components/primitives/TextLink";

export interface ProjectPageProps extends PageProps<ProjectPageData> {
  /** Takes a prompt over to Create, where the drafting happens. */
  onStartBuilding: (prompt: string) => void;
}

/** How many components the Overview lists before "View all". */
const COMPONENT_PREVIEW = 6;

/**
 * A project at a glance: how it's running (the best of Insights), a prompt
 * and starter ideas for building something new (the best of Create), then
 * what it already publishes and is built from. Each section after the first
 * is left out when its data is (its feature is off).
 */
export default function ProjectPage({ node, ancestors, currentPath, data, onStartBuilding }: ProjectPageProps) {
  const [prompt, setPrompt] = useState("");
  const { tiles, ideas, services, components } = data;

  // The prompt carries over to Create, where the drafting happens.
  const startBuilding = () => {
    const text = prompt.trim();
    if (text) onStartBuilding(text);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
        title={node.label}
        description={node.description}
      />

      <section>
        <SectionHeading
          title="This week"
          description="Runs and errors over the last 7 days, and open work orders."
          action={
            <TextLink to={`${currentPath}/insights`} variant="action">
              View insights
            </TextLink>
          }
        />
        <div className="-mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {tiles.map((tile) => (
            <StatTile
              key={tile.label}
              {...tile}
              trendClassName={tile.label === "Errors" ? "text-red-500" : undefined}
            />
          ))}
        </div>
      </section>

      {ideas && (
        <section>
          <SectionHeading
            title="Build something new"
            description="Describe a service in plain words, or start from an idea."
          />
          <div className="-mt-3 space-y-4">
            <BuildPrompt value={prompt} onChange={setPrompt} onSubmit={startBuilding} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {ideas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} onSelect={(i) => setPrompt(i.prompt)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className={`grid grid-cols-1 gap-8 ${services && components ? "lg:grid-cols-2" : ""}`}>
        {services && (
          <section>
            <SectionHeading
              title="Published services"
              description="What this project offers the rest of the organization."
            />
            {services.length > 0 ? (
              <div className="-mt-3 space-y-2">
                {services.map((svc) => (
                  <ListRow
                    key={svc.id}
                    icon={ClipboardList}
                    title={svc.name}
                    badges={<Badge label={svc.status} />}
                    description={svc.description}
                    to={`${currentPath}/services/${svc.id}`}
                  />
                ))}
              </div>
            ) : (
              <div className="-mt-3">
                <EmptyState
                  icon={ClipboardList}
                  title="No published services yet"
                  description="Publish a workflow as a service to list it in Services."
                />
              </div>
            )}
          </section>
        )}

        {components && (
          <section>
            <SectionHeading
              title="Components"
              description={`${components.length} building block${components.length !== 1 ? "s" : ""} in this project.`}
              action={
                components.length > 0 && (
                  <TextLink to={`${currentPath}/components`} variant="action">
                    View all
                  </TextLink>
                )
              }
            />
            {components.length > 0 ? (
              <Card flush className="-mt-3">
                {components.slice(0, COMPONENT_PREVIEW).map((comp) => (
                  <ComponentRow key={comp.id} component={comp} projectPath={currentPath} />
                ))}
              </Card>
            ) : (
              <div className="-mt-3">
                <EmptyState
                  title="No components yet"
                  description={
                    ideas
                      ? "Describe what you'd like to build above, and we'll draft the first ones."
                      : "Add one from the Components page."
                  }
                />
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
