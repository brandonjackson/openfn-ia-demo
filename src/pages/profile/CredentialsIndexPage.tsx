import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import CredentialIndex from "../../components/credentials/CredentialIndex";
import NewCredentialMenuButton from "../../components/credentials/NewCredentialMenuButton";

/**
 * Inventory view `credentials-index` (credential_live/index.html.heex): the
 * user's own OAuth clients and credentials, with "Add new" in the header.
 */
export default function CredentialsIndexPage() {
  return (
    <PageContent
      header={
        <Header title="Credentials">
          <NewCredentialMenuButton id="credential-options-menu-button" />
        </Header>
      }
    >
      <Centered>
        <CredentialIndex />
      </Centered>
    </PageContent>
  );
}
