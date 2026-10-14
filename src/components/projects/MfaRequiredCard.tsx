import Button from "../Button";
import TextLink from "../TextLink";

/**
 * The "MFA Required for Project" card (project_live/mfa_required.html.heex):
 * a red warning icon, why access is blocked, and a link to the profile page
 * where MFA is turned on.
 */
export default function MfaRequiredCard({ title = "MFA Required for Project" }: { title?: string }) {
  return (
    <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <span className="hero-exclamation-triangle h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <h3 className="text-base font-semibold leading-6 text-gray-900">{title}</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              This project requires all members to use multi-factor authentication. Please enable MFA for{" "}
              <TextLink to="/profile">your account</TextLink> in order to gain access.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button to="/profile" theme="primary">
          Visit your account
        </Button>
      </div>
    </div>
  );
}
