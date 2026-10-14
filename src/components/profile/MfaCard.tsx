import { useState } from "react";
import Button from "../Button";
import ConfirmModal from "../ConfirmModal";
import { TextInput } from "../Inputs";
import Modal from "../Modal";
import TextLink from "../TextLink";
import PlainSwitch from "../project-settings/PlainSwitch";
import ProfileCard, { ProfileCardHeading } from "./ProfileCard";
import { fakeTotpSecret } from "../../mock-data/profile";

interface Props {
  mfaEnabled: boolean;
  onChange?: (enabled: boolean) => void;
}

/** A stand-in for the TOTP QR code (Lightning renders a real one with EQRCode). */
function FakeQrCode() {
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21, y = Math.floor(i / 21);
    const finder = (cx: number, cy: number) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7 && (x === cx || x === cx + 6 || y === cy || y === cy + 6 || (x >= cx + 2 && x <= cx + 4 && y >= cy + 2 && y <= cy + 4));
    if (finder(0, 0) || finder(14, 0) || finder(0, 14)) return true;
    if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) return false;
    return ((x * 7 + y * 13 + x * y) % 5) < 2;
  });
  return (
    <svg viewBox="0 0 21 21" className="my-4 h-44 w-44" shapeRendering="crispEdges" aria-label="QR code (demo)">
      {cells.map((on, i) => on && <rect key={i} x={i % 21} y={Math.floor(i / 21)} width="1" height="1" />)}
    </svg>
  );
}

/**
 * The MFA card on /profile (profile_live/mfa_component.html.heex): the toggle
 * opens the authenticator-app setup, or the "Disable MFA" confirmation when
 * MFA is on; with MFA on it links to the recovery codes.
 */
export default function MfaCard({ mfaEnabled, onChange }: Props) {
  const id = "mfa_section";
  const [editing, setEditing] = useState(false);
  const [code, setCode] = useState("");
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const show = mfaEnabled || editing;

  const toggle = () => {
    if (mfaEnabled) setConfirmDisable(true);
    else setEditing((e) => !e);
  };

  return (
    <ProfileCard annotation="profile-mfa">
      <div className="flex items-center justify-between mb-5">
        <ProfileCardHeading
          id={id}
          title="Enable multi-factor authentication"
          description="This adds an additional layer of security to your account by requiring more than just a password to sign in."
        />
        <span className="ml-5">
          <PlainSwitch id="toggle-mfa-switch" checked={show} onChange={toggle} labelledBy={`${id}-label`} />
        </span>
      </div>
      {(mfaEnabled || editing) && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
        </div>
      )}

      {mfaEnabled && !editing && (
        <div className="py-5 text-sm">
          You have configured an authentication app to get two-factor authentication codes.{" "}
          <TextLink onClick={() => setEditing(true)} className="font-medium">
            Setup another device instead
          </TextLink>
        </div>
      )}

      {editing && (
        <div className="py-5">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">Authenticator app</h3>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Authenticator apps and browser extensions like 1Password, Authy etc. generate one-time passwords that are
              used as a second factor to verify your identity when prompted during sign-in.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">Scan the QR code</h3>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">Use an authenticator app or browser extension to scan.</p>
            <FakeQrCode />
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Unable to scan? You can use{" "}
              <TextLink onClick={() => setShowSecret(true)}>this secret key</TextLink>{" "}
              to manually configure your authenticator app.
            </p>
            <form
              id="set_totp_form"
              className="mt-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!/^\d{6}$/.test(code)) return;
                setEditing(false);
                setCode("");
                onChange?.(true);
              }}
            >
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <TextInput
                    label="Verify the code from the app"
                    autoComplete="one-time-code"
                    placeholder="XXXXXX"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div className="col-span-6 flex gap-1">
                  <Button theme="secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {mfaEnabled && (
        <div className="flex items-start justify-between my-5 mb-5">
          <div>
            <h3 className="font-medium leading-6 text-gray-900 pb-1">Recovery codes</h3>
            <p className="text-sm text-gray-500">
              Recovery codes can be used to access your account in the event you lose access to your device and cannot
              receive two-factor authentication codes.
            </p>
          </div>
          <Button theme="secondary" to="/profile/auth/backup_codes" className="ml-5">
            View
          </Button>
        </div>
      )}

      <ConfirmModal
        open={confirmDisable}
        onClose={() => setConfirmDisable(false)}
        title="Disable MFA"
        tone="danger"
        confirmLabel="Disable"
        onConfirm={() => {
          setConfirmDisable(false);
          onChange?.(false);
        }}
      >
        <p>
          Are you sure you want to disable MFA from your account? This will make your account less secure. Should an
          attacker get hold of your password, there will be nothing preventing them from accessing your account
        </p>
      </ConfirmModal>

      <Modal open={showSecret} onClose={() => setShowSecret(false)} title="Your two-factor secret" size="sm">
        <code className="text-sm text-gray-600">{fakeTotpSecret}</code>
      </Modal>
    </ProfileCard>
  );
}
