import type { PageRoute } from "../app/ia-utils";
import { instanceSettingsData } from "../fixtures/instance";
import InstanceSettingsPage from "./InstanceSettingsPage";
import { pageFrame } from "./route.fixtures";

/** Feeds every section of Instance settings from fixtures. */
export default function InstanceSettingsPageFixtures({ route }: { route: PageRoute }) {
  return <InstanceSettingsPage {...pageFrame(route)} data={instanceSettingsData} />;
}
