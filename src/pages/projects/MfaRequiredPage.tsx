import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import MfaRequiredCard from "../../components/projects/MfaRequiredCard";

/**
 * Inventory view `mfa-required` (ProjectLive.MFARequired): where a user
 * without MFA lands when a project requires it. The header has no title.
 */
export default function MfaRequiredPage() {
  return (
    <PageContent header={<Header />}>
      <Centered className="flex justify-center px-6 py-8">
        <MfaRequiredCard />
      </Centered>
    </PageContent>
  );
}
