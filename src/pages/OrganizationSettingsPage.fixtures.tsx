import type { PageRoute } from "../app/ia-utils";
import { organizationSettingsData } from "../fixtures/organization";
import OrganizationSettingsPage from "./OrganizationSettingsPage";
import { pageFrame } from "./route.fixtures";

/** Feeds every section of Organization settings from fixtures. */
export default function OrganizationSettingsPageFixtures({ route }: { route: PageRoute }) {
  return <OrganizationSettingsPage {...pageFrame(route)} data={organizationSettingsData} />;
}
