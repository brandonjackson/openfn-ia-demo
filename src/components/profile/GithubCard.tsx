import { useState } from "react";
import Button from "../Button";
import ConfirmModal from "../ConfirmModal";
import Card from "../Card";

interface Props {
  /** VersionControl.github_enabled?(): is a GitHub app configured on the instance? */
  oauthEnabled: boolean;
  connected: boolean;
  onDisconnect?: () => void;
}

/** The GitHub Access card on /profile (profile_live/github_component.ex). */
export default function GithubCard({ oauthEnabled, connected, onDisconnect }: Props) {
  const [confirming, setConfirming] = useState(false);
  return (
    <Card padding="lg"
      annotation="profile-github"
      title={<span id="github_section-label">GitHub Access</span>}
      description={
        <span id="github_section-description">
          Linking your OpenFn account to your GitHub account allows you to manage version control across your projects.
        </span>
      }
      action={
        !oauthEnabled ? (
          <Button id="github-oauth-not-enabled" disabled tooltip="GitHub OAuth has not been enabled for this instance.">
            Connect your GitHub account
          </Button>
        ) : connected ? (
          <Button id="disconnect-github-button" theme="danger" onClick={() => setConfirming(true)}>
            Disconnect from GitHub
          </Button>
        ) : (
          // Lightning links to the GitHub app's OAuth URL; the demo has none.
          <Button id="connect-github-link">Connect your GitHub Account</Button>
        )
      }
    >
      <ConfirmModal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Disconnect from GitHub?"
        tone="danger"
        confirmLabel="Disconnect"
        onConfirm={() => {
          setConfirming(false);
          onDisconnect?.();
        }}
      >
        <p>
          You are about to disconnect your OpenFn account from GitHub. Until you reconnect, you will not be able to set
          up or modify version control for your projects.
        </p>
      </ConfirmModal>
    </Card>
  );
}
