import { useState } from "react";
import type { PageRoute } from "../app/ia-utils";
import type { ApiToken } from "../model/page-data";
import { userSettingsData } from "../fixtures/user";
import UserSettingsPage from "./UserSettingsPage";
import { pageFrame } from "./route.fixtures";
import { useFlags } from "../app/feature-flags";

function fakeToken() {
  const hex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `ofn_pat_demo_${hex}`;
}

/** Feeds every section of User settings from fixtures, with tokens made or deleted this session. */
export default function UserSettingsPageFixtures({ route }: { route: PageRoute }) {
  // Your tokens as they stand this session: the fixtures' stand-in for the server.
  const [tokens, setTokens] = useState<ApiToken[]>(userSettingsData.apiTokens);
  const flags = useFlags();

  return (
    <UserSettingsPage
      {...pageFrame(route)}
      data={{ ...userSettingsData, apiTokens: tokens, orgCredentialsOnSystems: flags.connectedSystems }}
      onGenerateToken={async () => {
        const token = fakeToken();
        setTokens((prev) => [{ id: `tok-${Date.now()}`, suffix: token.slice(-4), createdAt: "Just now" }, ...prev]);
        return token;
      }}
      onDeleteToken={async (id) => setTokens((prev) => prev.filter((t) => t.id !== id))}
    />
  );
}
