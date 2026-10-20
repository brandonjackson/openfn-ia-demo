import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ProjectPageData } from "../page-data";
import Badge from "../components/Badge";
import PageHeader from "../components/PageHeader";
import BuildPrompt from "../components/BuildPrompt";
import Card from "../components/Card";
import ComponentRow from "../components/ComponentRow";
import EmptyState from "../components/EmptyState";
import IdeaCard from "../components/IdeaCard";
import ListRow from "../components/ListRow";
import SectionHeading from "../components/SectionHeading";
import StatTile from "../components/StatTile";
import TextLink from "../components/TextLink";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: ProjectPageData;
}

/** How many components the Overview lists before "View all". */
const COMPONENT_PREVIEW = 6;

/**
 * A project at a glance: how it's running (the best of Insights), a prompt
 * and starter ideas for building something new (the best of Create), then
 * what it already publishes and is built from.
 */
export default function ProjectTemplate({ node, ancestors, currentPath, data }: Props) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const { tiles, ideas, services, components } = data;

  // The prompt carries over to Create, where the drafting happens.
  const startBuilding = () => {
    const text = prompt.trim();
    if (text) navigate(`${currentPath}/create`, { state: { prompt: text } });
  };

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

      <section>
        <SectionHeading
          title="Build something new"
          description="Describe a service in plain words, or start from an idea."
          action={
            <TextLink to={`${currentPath}/create`} variant="action">
              See what you can build with
            </TextLink>
          }
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
                description="Describe what you'd like to build above, and we'll draft the first ones."
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
