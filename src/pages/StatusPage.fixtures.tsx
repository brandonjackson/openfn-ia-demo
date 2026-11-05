import type { PageRoute } from "../app/ia-utils";
import { statusData } from "../fixtures/status";
import StatusPage from "./StatusPage";
import { pageFrame } from "./route.fixtures";

/** Feeds the Status page from fixtures. */
export default function StatusPageFixtures({ route }: { route: PageRoute }) {
  return <StatusPage {...pageFrame(route)} data={statusData} />;
}
