import Button from "../Button";

/** Shown on the backup codes page when MFA is off (backup_codes_live/index.html.heex). */
export default function MfaDisabledNotice() {
  return (
    <div className="rounded-lg bg-white px-4 pb-4 pt-5 text-left sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <span className="hero-exclamation-triangle h-6 w-6 text-red-600" />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <h3 className="text-base font-semibold leading-6 text-gray-900">MFA Disabled</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              In order to use backup codes, you need to have MFA enabled in your account. You can enable MFA in your
              account by visiting your profile page.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4">
        <Button to="/profile">Back to profile</Button>
      </div>
    </div>
  );
}
