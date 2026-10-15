import { useState, type ReactNode } from "react";
import Button from "../Button";
import Card from "../Card";
import ConfirmModal from "../ConfirmModal";
import { DetailItem, DetailList } from "../DetailList";
import Pill from "../Pill";
import SectionHeader from "../SectionHeader";
import TextLink from "../TextLink";
import SandboxSettingsBanner from "./SandboxSettingsBanner";
import type { VcsFixture } from "../../types/project-settings";

interface Props {
  vcs: VcsFixture;
  canInstallGithub: boolean;
  canInitiateGithubSync: boolean;
  /** Whether the viewer has linked their OpenFn account to GitHub. */
  userGithubConnected: boolean;
  sandbox?: boolean;
}

/**
 * The Sync to GitHub tab (`#vcs`, settings.html.heex:758-860 and
 * github_sync_component.html.heex). Shows "not configured", "connect your
 * account", or a connected repo, depending on the fixture. The
 * installation / repo / branch form for a new connection needs the GitHub
 * API, so it isn't reproduced.
 */
export default function GithubSyncPanel({ vcs, canInstallGithub, canInitiateGithubSync, userGithubConnected, sandbox = false }: Props) {
  const [connection, setConnection] = useState(vcs.connection);
  const [confirmRemove, setConfirmRemove] = useState(false);

  let body: ReactNode = null;
  if (!vcs.githubEnabled) {
    body = (
      <Card
        title="Sync to GitHub"
        description="Version Control is not configured for this Lightning instance. Contact the superuser for more information."
      />
    );
  } else if (connection) {
    body = (
      <div id="github-sync-component" className="space-y-2">
        <Card className="space-y-4">
          <DetailList>
            <DetailItem label="Repository:">
              <TextLink href={`https://www.github.com/${connection.repo}`} external>
                {connection.repo}
              </TextLink>
            </DetailItem>
            <DetailItem label="Branch:">
              <Pill square mono>{connection.branch}</Pill>
            </DetailItem>
            <DetailItem label="GitHub Installation ID:">
              <Pill square mono>{connection.githubInstallationId}</Pill>
            </DetailItem>
            <DetailItem label="Path to config:">
              <Pill square mono>{connection.configPath}</Pill>
            </DetailItem>
            <DetailItem label="Sync version:">
              <Pill square mono>{connection.syncVersion ? "v2 (new)" : "v1 (legacy)"}</Pill>
            </DetailItem>
          </DetailList>
          <Button
            id="initiate-sync-button"
            disabled={!canInitiateGithubSync}
            tooltip={canInitiateGithubSync ? undefined : "Contact an editor or admin to sync."}
          >
            Initiate Sync to Branch
          </Button>
        </Card>
        {canInstallGithub && (
          <p>
            No longer need to sync this project?{" "}
            <TextLink variant="danger" onClick={() => setConfirmRemove(true)}>
              Remove Integration.
            </TextLink>
          </p>
        )}
        {/* github_sync_component.ex `confirm_connection_removal_modal` */}
        <ConfirmModal
          open={confirmRemove}
          onClose={() => setConfirmRemove(false)}
          onConfirm={() => {
            setConnection(null);
            setConfirmRemove(false);
          }}
          title="Remove Integration?"
          confirmLabel="Disconnect"
          tone="danger"
        >
          <p>
            You are about to disconnect this project from GitHub. Until you reconnect, you will not be able to sync
            this project to GitHub.
          </p>
        </ConfirmModal>
      </div>
    );
  } else if (canInstallGithub && !userGithubConnected) {
    body = (
      <Card
        title="Connect your OpenFn account to GitHub"
        description="To create a new GitHub version control connection you must first connect your OpenFn account to GitHub. Please click the button below to get started."
      >
        <Button id="connect-github-link">Connect your GitHub Account</Button>
      </Card>
    );
  } else if (canInstallGithub) {
    body = (
      <Card
        title="Connect a repository"
        description="Choose a GitHub installation, repository and branch to start syncing. (The connection form needs the GitHub API and isn't reproduced in this demo.)"
      />
    );
  }

  return (
    <>
      <SectionHeader
        title="Version control"
        subtitle="View or modify external version control settings for this project."
        permissionsSection={
          canInstallGithub
            ? undefined
            : `version control configuration${canInitiateGithubSync ? " but you can initiate a sync." : "."}`
        }
      />
      {sandbox && <SandboxSettingsBanner variant="local" />}
      {body}
      <p>
        Need to learn more about GitHub Sync? See{" "}
        <TextLink
          href="https://docs.openfn.org/documentation/deploy/portability#automated-version-control-with-github-and-lightning"
          external
        >
          portability docs
        </TextLink>{" "}
        for full documentation on associated GitHub actions and automated workflows.
      </p>
    </>
  );
}
