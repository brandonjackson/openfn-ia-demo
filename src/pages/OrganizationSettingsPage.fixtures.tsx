import { useState } from "react";
import type { PageRoute } from "../app/ia-utils";
import type { ContextLayer } from "../model/page-data";
import { organizationSettingsData } from "../fixtures/organization";
import OrganizationSettingsPage from "./OrganizationSettingsPage";
import { pageFrame } from "./route.fixtures";
import { useFlags } from "../app/feature-flags";

/**
 * Feeds every section of Organization settings from fixtures, with context
 * layers requested this session, leaving out what the feature flags turn off.
 */
export default function OrganizationSettingsPageFixtures({ route }: { route: PageRoute }) {
  // Context layers as they stand this session: the fixtures' stand-in for the server.
  const [layers, setLayers] = useState<ContextLayer[]>(organizationSettingsData.contextLayers);
  const flags = useFlags();
  const { visibility } = organizationSettingsData;

  return (
    <OrganizationSettingsPage
      {...pageFrame(route)}
      data={{
        ...organizationSettingsData,
        contextLayers: layers,
        // Without a feature, there's nothing of it to set a default for.
        visibility: {
          projects: visibility.projects,
          systems: flags.connectedSystems ? visibility.systems : undefined,
          services: flags.serviceCatalog ? visibility.services : undefined,
        },
        xroad: flags.xroad ? organizationSettingsData.xroad : undefined,
      }}
      onRequestContextAccess={async (url) => {
        let host = url;
        try {
          host = new URL(url).host;
        } catch {
          // Not a full URL; show what was typed.
        }
        setLayers((prev) => [...prev, { id: `layer-${Date.now()}`, name: host, host: url, url, status: "pending" }]);
      }}
      onRemoveContextLayer={async (id) => setLayers((prev) => prev.filter((l) => l.id !== id))}
    />
  );
}
