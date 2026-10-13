import { useState } from "react";
import type { DashboardPageData } from "../page-data";
import ConnectedSystemsSetupSection from "./dashboard-sections/ConnectedSystemsSetupSection";
import SuggestedServicesSection from "./dashboard-sections/SuggestedServicesSection";
import AddConnectedSystemFlow from "../components/AddConnectedSystemFlow";
import PageHeader from "../components/PageHeader";
import StatTile from "../components/StatTile";
import ActivityList from "../components/ActivityList";
import SectionHeading from "../components/SectionHeading";
import TextLink from "../components/TextLink";

interface Props {
  data: DashboardPageData;
}

/**
 * Overview: what needs your attention and what's happened recently. The
 * tiles summarise Status and Insights and link through for the detail.
 */
export default function DashboardTemplate({ data }: Props) {
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
        description="What needs your attention, and what's happened recently."
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <SectionHeading
            title="Needs attention"
            action={<TextLink to="/status" variant="action">View status</TextLink>}
          />
          <ActivityList items={data.attention} emptyMessage="Nothing needs your attention." />
        </section>
        <section>
          <SectionHeading
            title="Recent activity"
            action={<TextLink to="/history" variant="action">View history</TextLink>}
          />
          <ActivityList items={data.recentActivity} emptyMessage="No activity yet." />
        </section>
      </div>

      <ConnectedSystemsSetupSection
        systems={data.connectedSystems}
        recommendedSystems={data.recommendedSystems}
        recommended={data.recommended}
        onAddSystem={handleOpenAddFlow}
      />

      <SuggestedServicesSection
        services={data.suggestedServices}
        systems={data.connectedSystems}
      />

      <AddConnectedSystemFlow
        open={addFlowOpen}
        onClose={() => setAddFlowOpen(false)}
        preselectedSystem={preselectedSystem}
      />
    </div>
  );
}
