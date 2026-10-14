import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Button from "../../components/Button";
import { Centered, PageContent } from "../../components/PageContent";
import NewTokenBanner from "../../components/profile/NewTokenBanner";
import TokensTable from "../../components/profile/TokensTable";
import TokenDeletionModal from "../../components/profile/TokenDeletionModal";
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

  const generate = () => {
    const token = generateFakeToken();
    setTokens((list) => [token, ...list]);
    setNewToken(token.token);
  };

  return (
    <PageContent
      header={
        <Header title="Personal Access Tokens">
          <Button onClick={generate}>
            <div className="h-full">
              <span className="hero-plus h-4 w-4 inline-block" />{" "}
              <span className="inline-block align-middle">Generate New Token</span>
            </div>
          </Button>
        </Header>
      }
    >
      <Centered>
        {tokenId && tokens.some((t) => t.id === tokenId) && (
          <TokenDeletionModal
            id={tokenId}
            onClose={() => navigate("/profile/tokens")}
            onDelete={() => setTokens((list) => list.filter((t) => t.id !== tokenId))}
          />
        )}
        {newToken && <NewTokenBanner token={newToken} />}
        <TokensTable tokens={tokens} onGenerate={generate} />
      </Centered>
    </PageContent>
  );
}
