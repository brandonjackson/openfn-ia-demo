import Button from "../Button";
import Card from "../Card";
import Heading from "../Heading";
import TextLink from "../TextLink";

/**
 * The "MFA Required for Project" card (project_live/mfa_required.html.heex):
 * a red warning icon, why access is blocked, and a link to the profile page
 * where MFA is turned on.
 */
export default function MfaRequiredCard({ title = "MFA Required for Project" }: { title?: string }) {
  return (
    <Card padding="lg" className="max-w-lg space-y-5">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
          <span className="hero-exclamation-triangle h-6 w-6 text-red-600" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <Heading>{title}</Heading>
          <p className="text-sm text-gray-500">
            This project requires all members to use multi-factor authentication. Please enable MFA for{" "}
            <TextLink to="/profile">your account</TextLink> in order to gain access.
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button to="/profile">Visit your account</Button>
      </div>
    </Card>
  );
}
