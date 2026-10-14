import { useState } from "react";
import Button from "../Button";
import Modal from "../Modal";
import ProfileCard, { ProfileCardHeading } from "./ProfileCard";
import { buttonClasses } from "../buttonClasses";

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
    <ProfileCard annotation="profile-github">
      <div className="flex items-center justify-between mb-5 gap-5">
        <ProfileCardHeading
          id="github_section"
          title="GitHub Access"
          description="Linking your OpenFn account to your GitHub account allows you to manage version control across your projects."
        />
        {!oauthEnabled ? (
          <Button id="github-oauth-not-enabled" disabled tooltip="GitHub OAuth has not been enabled for this instance.">
            Connect your GitHub account
          </Button>
        ) : connected ? (
          <Button id="disconnect-github-button" theme="danger" onClick={() => setConfirming(true)}>
            Disconnect from GitHub
          </Button>
        ) : (
          <a id="connect-github-link" href="#" onClick={(e) => e.preventDefault()} className={buttonClasses("primary")}>
            Connect your GitHub Account
          </a>
        )}
      </div>
      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        width="max-w-md"
        title={<span className="font-bold">Disconnect from GitHub?</span>}
        footer={
          <>
            <Button
              id="disconnect_github_modal_confirm_button"
              theme="danger"
              onClick={() => {
                setConfirming(false);
                onDisconnect?.();
              }}
            >
              Disconnect
            </Button>
            <Button theme="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          You are about to disconnect your OpenFn account from GitHub. Until you reconnect, you will not be able to set
          up or modify version control for your projects.
        </p>
      </Modal>
    </ProfileCard>
  );
}
