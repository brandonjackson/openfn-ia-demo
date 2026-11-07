import { GitBranch, Settings2, Unplug } from "lucide-react";
import type { GitHubConnection, GitHubInstallation } from "../../model/github-sync";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Inline from "../primitives/Inline";
import PropertyList from "../primitives/PropertyList";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import TextLink from "../primitives/TextLink";

interface Props {
  /** The project's id, which names its default config file. */
  projectId: string;
  connection: GitHubConnection;
  /** The installations your account can use, to name the connection's. */
  installations: GitHubInstallation[];
  /** Starts a sync to the branch. Left out when you can't (viewers). */
  onSync?: () => void;
  /** Opens the settings to change them. Left out when you can't. */
  onEdit?: () => void;
  /** Asks to disconnect. Left out when you can't. */
  onDisconnect?: () => void;
}

/** A project's connection to a GitHub branch, with a sync and its settings. */
export default function GitHubConnectionSummary({ projectId, connection, installations, onSync, onEdit, onDisconnect }: Props) {
  const installation = installations.find((i) => i.id === connection.installationId);
  return (
    <Stack gap="md">
      <Callout variant="success" icon={GitBranch} title="Two-way sync with GitHub is on">
        Changes in OpenFn can be committed to {connection.repo}, and commits to {connection.branch} are deployed here.
      </Callout>
      <PropertyList
        properties={[
          {
            label: "Repository",
            value: (
              <TextLink variant="inline" href={`https://github.com/${connection.repo}`}>
                {connection.repo}
              </TextLink>
            ),
          },
          { label: "Branch", value: <Text mono>{connection.branch}</Text> },
          {
            label: "Installation",
            value: installation ? `${installation.account} (${installation.id})` : connection.installationId,
          },
          {
            label: "Config",
            value: <Text mono>{connection.configPath || `./openfn-${projectId}-config.json`}</Text>,
          },
          { label: "Last sync", value: connection.lastSyncedAt ?? "Not synced yet" },
        ]}
      />
      <Inline gap="sm" wrap>
        <Button icon={GitBranch} disabled={!onSync} title={onSync ? undefined : "Contact an editor or admin to sync."} onClick={onSync}>
          Initiate sync to branch
        </Button>
        {onEdit && (
          <Button variant="secondary" icon={Settings2} onClick={onEdit}>
            Change settings
          </Button>
        )}
        {onDisconnect && (
          <Button variant="outline-danger" icon={Unplug} onClick={onDisconnect}>
            Remove integration
          </Button>
        )}
      </Inline>
    </Stack>
  );
}
