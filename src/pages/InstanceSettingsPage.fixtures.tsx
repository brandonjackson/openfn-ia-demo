import { useState } from "react";
import type { PageRoute } from "../app/ia-utils";
import type { ContextLayer } from "../model/page-data";
import { instanceSettingsData } from "../fixtures/instance";
import InstanceSettingsPage from "./InstanceSettingsPage";
import { pageFrame } from "./route.fixtures";

/** Feeds every section of Instance settings from fixtures, with context sources requested this session. */
export default function InstanceSettingsPageFixtures({ route }: { route: PageRoute }) {
  // Context sources as they stand this session: the fixtures' stand-in for the server.
  const [layers, setLayers] = useState<ContextLayer[]>(instanceSettingsData.contextLayers);

  return (
    <InstanceSettingsPage
      {...pageFrame(route)}
      data={{ ...instanceSettingsData, contextLayers: layers }}
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
