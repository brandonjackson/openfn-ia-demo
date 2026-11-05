import { useState } from "react";
import type { PageRoute } from "../app/ia-utils";
import type { ContextLayer } from "../model/page-data";
import { organizationSettingsData } from "../fixtures/organization";
import OrganizationSettingsPage from "./OrganizationSettingsPage";
import { pageFrame } from "./route.fixtures";

/** Feeds every section of Organization settings from fixtures, with context layers requested this session. */
export default function OrganizationSettingsPageFixtures({ route }: { route: PageRoute }) {
  // Context layers as they stand this session: the fixtures' stand-in for the server.
  const [layers, setLayers] = useState<ContextLayer[]>(organizationSettingsData.contextLayers);

  return (
    <OrganizationSettingsPage
      {...pageFrame(route)}
      data={{ ...organizationSettingsData, contextLayers: layers }}
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
