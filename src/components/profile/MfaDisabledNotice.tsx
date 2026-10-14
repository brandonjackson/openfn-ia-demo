import Alert from "../Alert";
import Button from "../Button";

/** Shown on the backup codes page when MFA is off (backup_codes_live/index.html.heex). */
export default function MfaDisabledNotice() {
  return (
    <Alert type="warning" header="MFA Disabled">
      <p>
        In order to use backup codes, you need to have MFA enabled in your account. You can enable MFA in your account
        by visiting your profile page.
      </p>
      <Button to="/profile" className="mt-4">
        Back to profile
      </Button>
    </Alert>
  );
}
