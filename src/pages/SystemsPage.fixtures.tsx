import type { PageRoute } from "../app/ia-utils";
import { systemsPageData } from "../fixtures";
import SystemsPage from "./SystemsPage";
import { pageFrame } from "./route.fixtures";

/** Feeds the Systems page from fixtures. */
export default function SystemsPageFixtures({ route }: { route: PageRoute }) {
  return <SystemsPage {...pageFrame(route)} data={systemsPageData} />;
}
