import type { PageRoute } from "../app/ia-utils";
import { userSettingsData } from "../fixtures/user";
import UserSettingsPage from "./UserSettingsPage";
import { pageFrame } from "./route.fixtures";

/** Feeds every section of User settings from fixtures. */
export default function UserSettingsPageFixtures({ route }: { route: PageRoute }) {
  return <UserSettingsPage {...pageFrame(route)} data={userSettingsData} />;
}
