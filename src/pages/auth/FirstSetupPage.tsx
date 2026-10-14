import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";

/** Inventory view `first-setup`. Placeholder until the page is built. */
export default function FirstSetupPage() {
  return (
    <PageContent header={<Header title="First setup" />}>
      <Centered>
        <p className="text-sm text-gray-500">Not built yet: first-setup</p>
      </Centered>
    </PageContent>
  );
}
