import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Button from "../../components/Button";
import { Centered, PageContent } from "../../components/PageContent";
import NewTokenBanner from "../../components/profile/NewTokenBanner";
import TokensTable from "../../components/profile/TokensTable";
import TokenDeletionModal from "../../components/profile/TokenDeletionModal";
import { useToast } from "../../components/Toast";
import { apiTokens, generateFakeToken, type ApiToken } from "../../mock-data/tokens";

/**
 * Inventory view `profile-tokens` (tokens_live/index.html.heex): "Generate
 * New Token" shows the new token once in a banner; the table masks the rest.
 * /profile/tokens/:tokenId/delete opens the delete modal.
 */
export default function TokensPage() {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<ApiToken[]>(apiTokens);
  const [newToken, setNewToken] = useState<string | null>(null);
  const toast = useToast();

  const generate = () => {
    const token = generateFakeToken();
    setTokens((list) => [token, ...list]);
    setNewToken(token.token);
    toast("Token created successfully");
  };

  return (
    <PageContent
      header={
        <Header title="Personal Access Tokens">
          <Button onClick={generate}>
            <span className="hero-plus h-4 w-4" />
            Generate New Token
          </Button>
        </Header>
      }
    >
      <Centered>
        {tokenId && tokens.some((t) => t.id === tokenId) && (
          <TokenDeletionModal
            onClose={() => navigate("/profile/tokens")}
            onDelete={() => {
              setTokens((list) => list.filter((t) => t.id !== tokenId));
              toast("Token deleted successfully");
            }}
          />
        )}
        {newToken && <NewTokenBanner token={newToken} />}
        <TokensTable tokens={tokens} onGenerate={generate} />
      </Centered>
    </PageContent>
  );
}
