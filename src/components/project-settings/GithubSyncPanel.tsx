import { useState } from "react";
import Button from "../Button";
import SectionHeader from "../SectionHeader";
import RemoveIntegrationModal from "./RemoveIntegrationModal";
import SandboxSettingsBanner from "./SandboxSettingsBanner";
import SettingsCard from "./SettingsCard";
import { linkClass, linkDangerClass } from "./classes";
import type { VcsFixture } from "../../mock-data/project-settings";

interface Props {
  vcs: VcsFixture;
  canInstallGithub: boolean;
  canInitiateGithubSync: boolean;
  /** Whether the viewer has linked their OpenFn account to GitHub. */
  userGithubConnected: boolean;
  sandbox?: boolean;
}

const chip = "text-xs font-mono bg-gray-200 rounded-md p-1";

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

  let body;
  if (!vcs.githubEnabled) {
    body = (
      <div className="bg-white p-4 rounded-md">
        <h6 className="font-medium text-black">Sync to GitHub</h6>
        <small className="block mt-1 text-xs text-gray-600">
          Version Control is not configured for this Lightning instance. Contact the superuser for more information.
        </small>
      </div>
    );
  } else if (connection) {
    body = (
      <div id="github-sync-component">
        <div className="bg-white p-4 rounded-md">
          <div className="flex flex-col gap-2 text-black">
            <span>
              Repository:{" "}
              <a href={`https://www.github.com/${connection.repo}`} target="_blank" rel="noreferrer" className={linkClass}>
                {connection.repo}
              </a>
            </span>
            <span>
              Branch: <span className={chip}>{connection.branch}</span>
            </span>
            <span>
              GitHub Installation ID: <span className={chip}>{connection.githubInstallationId}</span>
            </span>
            <span>
              Path to config: <span className={chip}>{connection.configPath}</span>
            </span>
            <span>
              Sync version: <span className={chip}>{connection.syncVersion ? "v2 (new)" : "v1 (legacy)"}</span>
            </span>
            <div className="pt-2">
              <Button
                id="initiate-sync-button"
                disabled={!canInitiateGithubSync}
                tooltip={canInitiateGithubSync ? undefined : "Contact an editor or admin to sync."}
              >
                Initiate Sync to Branch
              </Button>
            </div>
          </div>
        </div>
        {canInstallGithub && (
          <div className="mt-2">
            No longer need to sync this project?{" "}
            <a
              href="#vcs"
              className={linkDangerClass}
              onClick={(e) => {
                e.preventDefault();
                setConfirmRemove(true);
              }}
            >
              Remove Integration.
            </a>
          </div>
        )}
        {confirmRemove && (
          <RemoveIntegrationModal
            onCancel={() => setConfirmRemove(false)}
            onConfirm={() => {
              setConnection(null);
              setConfirmRemove(false);
            }}
          />
        )}
      </div>
    );
  } else if (canInstallGithub && !userGithubConnected) {
    body = (
      <SettingsCard
        title="Connect your OpenFn account to GitHub"
        description="To create a new GitHub version control connection you must first connect your OpenFn account to GitHub. Please click the button below to get started."
        className="space-y-0"
      >
        <div className="mt-6">
          <Button id="connect-github-link">Connect your GitHub Account</Button>
        </div>
      </SettingsCard>
    );
  } else if (canInstallGithub) {
    body = (
      <SettingsCard
        title="Connect a repository"
        description="Choose a GitHub installation, repository and branch to start syncing. (The connection form needs the GitHub API and isn't reproduced in this demo.)"
      />
    );
  } else {
    body = null;
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
      <div className="mt-2">
        Need to learn more about GitHub Sync? See{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://docs.openfn.org/documentation/deploy/portability#automated-version-control-with-github-and-lightning"
          className={linkClass}
        >
          portability docs
        </a>{" "}
        for full documentation on associated GitHub actions and automated workflows.
      </div>
    </>
  );
}
