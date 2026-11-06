import type { PageRoute } from "../app/ia-utils";
import { statusData } from "../fixtures/status";
import StatusPage from "./StatusPage";
import { pageFrame } from "../app/page-frame";
import { useFlags } from "../app/feature-flags";
import { systemsFor } from "./flagged.fixtures";

/** Feeds the Status page from fixtures: workflows, and the systems the feature flags leave. */
export default function StatusPageFixtures({ route }: { route: PageRoute }) {
  const flags = useFlags();
  const shown = new Set(systemsFor(flags).map((s) => s.id));
  return (
    <StatusPage
      {...pageFrame(route)}
      data={{
        ...statusData,
        systems: flags.connectedSystems ? statusData.systems?.filter((s) => shown.has(s.id)) : undefined,
      }}
    />
  );
}
