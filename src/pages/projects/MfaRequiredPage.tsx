import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";

/** Inventory view `mfa-required`. Placeholder until the page is built. */
export default function MfaRequiredPage() {
  return (
    <PageContent header={<Header title="MFA required" />}>
      <Centered>
        <p className="text-sm text-gray-500">Not built yet: mfa-required</p>
      </Centered>
    </PageContent>
  );
}
