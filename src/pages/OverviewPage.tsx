import { useState } from "react";
import type { DashboardPageData } from "../model/page-data";
import ConnectedSystemsSetupSection from "../components/patterns/ConnectedSystemsSetupSection";
import AddConnectedSystemFlow from "../components/patterns/AddConnectedSystemFlow";
import PageHeader from "../components/patterns/PageHeader";
import ProjectCard from "../components/domain/ProjectCard";
import StatTile from "../components/primitives/StatTile";
import SectionHeading from "../components/primitives/SectionHeading";
import TextLink from "../components/primitives/TextLink";

interface Props {
  data: DashboardPageData;
}

/**
 * Overview: summary tiles that link through to Status and Insights, setup
 * progress for connected systems, and your projects.
 */
export default function OverviewPage({ data }: Props) {
  const [addFlowOpen, setAddFlowOpen] = useState(false);
  const [preselectedSystem, setPreselectedSystem] = useState<string | undefined>();

  const handleOpenAddFlow = (systemName?: string) => {
    setPreselectedSystem(systemName);
    setAddFlowOpen(true);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description="How things are running, and the projects you're working on."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {data.tiles.map((tile) => (
          <StatTile
            key={tile.label}
            {...tile}
            trendClassName={tile.label.startsWith("Errors") ? "text-red-500" : undefined}
          />
        ))}
      </div>

      <ConnectedSystemsSetupSection
        systems={data.connectedSystems}
        recommendedSystems={data.recommendedSystems}
        recommended={data.recommended}
        onAddSystem={handleOpenAddFlow}
      />

      <section>
        <SectionHeading
          title="Projects"
          action={<TextLink to="/projects" variant="action">View all projects</TextLink>}
        />
        <div className="space-y-2">
          {data.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <AddConnectedSystemFlow
        open={addFlowOpen}
        onClose={() => setAddFlowOpen(false)}
        preselectedSystem={preselectedSystem}
      />
    </div>
  );
}
