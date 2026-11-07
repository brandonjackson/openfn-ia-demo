import { useState } from "react";
import ConnectedSystemsSetupSection from "../../components/domain/ConnectedSystemsSetupSection";
import AddConnectedSystemFlow, { type NewSystemInput } from "../../components/domain/AddConnectedSystemFlow";
import PageHeader from "../../components/patterns/PageHeader";
import ProjectCard from "../../components/domain/ProjectCard";
import StatTile from "../../components/primitives/StatTile";
import SectionHeading from "../../components/primitives/SectionHeading";
import TextLink from "../../components/primitives/TextLink";
import type { StatTileData } from "../../model/page-data";
import type { ConnectedSystemSummary, SuggestedSystem } from "../../model/connected-systems";
import type { ProjectSummary } from "../../model/projects";
import type { Adaptor } from "../../model/adaptors";

export interface OverviewPageProps {
  /** Everything the page shows. */
  data: OverviewPageData;
  /** Adds a system from the "Add connected system" form. Without it the form only pretends. */
  onAddSystem?: (system: NewSystemInput) => Promise<void>;
}

/**
 * Overview: summary tiles that link through to the detail, setup
 * progress for connected systems (when the organisation has them), and your
 * projects.
 */
export default function OverviewPage({ data, onAddSystem }: OverviewPageProps) {
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

      {data.connectedSystems && (
        <ConnectedSystemsSetupSection
          systems={data.connectedSystems}
          recommendedSystems={data.recommendedSystems}
          recommended={data.recommended}
          onAddSystem={handleOpenAddFlow}
        />
      )}

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
        open={addFlowOpen && !!data.connectedSystems}
        onClose={() => setAddFlowOpen(false)}
        adaptors={data.adaptors}
        preselectedSystem={preselectedSystem}
        onAdd={onAddSystem}
      />
    </div>
  );
}

/** What Overview shows. */
export interface OverviewPageData {
  /** Summary tiles, each opening the page with the detail (the week's runs and errors open Insights). */
  tiles: StatTileData[];
  /** The organisation's systems, for setup progress. Absent without connected systems, which leaves the section out. */
  connectedSystems?: ConnectedSystemSummary[];
  /** Systems suggested for the organisation that it hasn't connected yet. */
  recommendedSystems: SuggestedSystem[];
  /** Your projects. */
  projects: ProjectSummary[];
  /** How many systems setup counts towards: those connected and those suggested. */
  recommended: number;
  /** Every adaptor a new system can be connected with. */
  adaptors: Adaptor[];
}
