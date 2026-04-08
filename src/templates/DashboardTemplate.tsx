import { useState } from "react";
import type { DashboardPageData } from "../page-data";
import ConnectedSystemsSetupSection from "./dashboard-sections/ConnectedSystemsSetupSection";
import SuggestedServicesSection from "./dashboard-sections/SuggestedServicesSection";
import AddConnectedSystemFlow from "../components/AddConnectedSystemFlow";

interface Props {
  data: DashboardPageData;
}

export default function DashboardTemplate({ data }: Props) {
  const [addFlowOpen, setAddFlowOpen] = useState(false);
  const [preselectedSystem, setPreselectedSystem] = useState<string | undefined>();

  const handleOpenAddFlow = (systemName?: string) => {
    setPreselectedSystem(systemName);
    setAddFlowOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
        <p className="mt-1 text-gray-500 text-sm">
          Your integration platform at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {data.metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{metric.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {metric.value}
            </p>
          </div>
        ))}
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
