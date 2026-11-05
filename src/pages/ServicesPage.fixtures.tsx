import type { PageRoute } from "../app/ia-utils";
import { serviceCatalogData } from "../fixtures/service-catalog";
import ServicesPage from "./ServicesPage";
import { pageFrame } from "./route.fixtures";

/** Feeds the Services catalog from fixtures. */
export default function ServicesPageFixtures({ route }: { route: PageRoute }) {
  return <ServicesPage {...pageFrame(route)} data={serviceCatalogData} />;
}
