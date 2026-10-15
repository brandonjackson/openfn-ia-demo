import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import CredentialIndex from "../../components/credentials/CredentialIndex";
import NewCredentialMenuButton from "../../components/credentials/NewCredentialMenuButton";
import { credentialsFor, oauthClientsFor } from "../../mock-data/credentials";
import { useCurrentUser, usePermissions } from "../../session/session";

/**
 * Inventory view `credentials-index` (credential_live/index.html.heex): the
 * user's own OAuth clients and credentials, with "Add new" in the header.
 */
export default function CredentialsIndexPage() {
  const user = useCurrentUser();
  const { canCreateGlobalOauthClient } = usePermissions();
  return (
    <PageContent
      header={
        <Header title="Credentials">
          <NewCredentialMenuButton id="credential-options-menu-button" />
        </Header>
      }
    >
      <Centered>
        <CredentialIndex
          credentials={credentialsFor(undefined, user)}
          oauthClients={oauthClientsFor(undefined, user)}
          // Lightning hard-codes it here (credential_live/index.html.heex:33).
          canCreateProjectCredential
          canCreateGlobalOauthClient={canCreateGlobalOauthClient}
        />
      </Centered>
    </PageContent>
  );
}
