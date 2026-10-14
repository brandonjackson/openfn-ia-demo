import { useState } from "react";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import BackupCodesCard from "../../components/profile/BackupCodesCard";
import MfaDisabledNotice from "../../components/profile/MfaDisabledNotice";
import { currentUser } from "../../mock-data/users";
import { backupCodes, regenerateFakeBackupCodes } from "../../mock-data/tokens";

/**
 * Inventory view `profile-backup-codes` (backup_codes_live/index.html.heex).
 * Lightning puts this behind sudo mode (re-enter password); the demo skips that.
 * Like Lightning, the MFA-disabled notice sits above the codes when MFA is off.
 */
export default function BackupCodesPage() {
  const [codes, setCodes] = useState(backupCodes);
  return (
    <PageContent header={<Header title="Two-factor backup codes" />}>
      <Centered>
        <div className="space-y-4 md:w-2/3">
          <p>
            Recovery codes can be used to access your account in the event you lose access to your device and cannot
            receive two-factor authentication codes.
          </p>
          {!currentUser.mfaEnabled && <MfaDisabledNotice />}
          <BackupCodesCard codes={codes} onRegenerate={() => setCodes(regenerateFakeBackupCodes())} />
        </div>
      </Centered>
    </PageContent>
  );
}
