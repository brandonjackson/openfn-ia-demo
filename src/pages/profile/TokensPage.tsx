import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Button from "../../components/Button";
import { Centered, PageContent } from "../../components/PageContent";
import NewTokenBanner from "../../components/profile/NewTokenBanner";
import TokensTable from "../../components/profile/TokensTable";
import TokenDeletionModal from "../../components/profile/TokenDeletionModal";
import { useToast } from "../../components/Toast";
import { apiTokens, generateFakeToken } from "../../mock-data/tokens";
import { simulateRequest } from "../../mock-data/request";
import type { ApiToken } from "../../types/tokens";
import { errorMessage } from "../../utils/errors";
import { useAction } from "../../utils/useAction";

/**
 * Inventory view `profile-tokens` (tokens_live/index.html.heex): "Generate
 * New Token" shows the new token once in a banner; the table masks the rest.
 * /profile/tokens/:tokenId/delete opens the delete modal.
 *
 * The worked example of STANDARDS.md patterns 1, 4 and 7: the page owns the
 * list, every mutation awaits a request, the button shows pending, success
 * toasts here and failure toasts here.
 */
export default function TokensPage() {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<ApiToken[]>(apiTokens);
  const [newToken, setNewToken] = useState<string | null>(null);
  const toast = useToast();

  const generate = useAction(
    async () => {
      const token = await simulateRequest(generateFakeToken());
      setTokens((list) => [token, ...list]);
      setNewToken(token.token);
      toast("Token created successfully");
    },
    { onError: (e) => toast(errorMessage(e), "error") }
  );
  const remove = async (id: string) => {
    await simulateRequest();
    setTokens((list) => list.filter((t) => t.id !== id));
    toast("Token deleted successfully");
  };

  return (
    <PageContent
      header={
        <Header title="Personal Access Tokens">
          <Button onClick={() => generate.run()} pending={generate.pending}>
            <span className="hero-plus h-4 w-4" />
            Generate New Token
          </Button>
        </Header>
      }
    >
      <Centered>
        {tokenId && tokens.some((t) => t.id === tokenId) && (
          <TokenDeletionModal onClose={() => navigate("/profile/tokens")} onDelete={() => remove(tokenId)} />
        )}
        {newToken && <NewTokenBanner token={newToken} />}
        <TokensTable tokens={tokens} onGenerate={() => generate.run()} />
      </Centered>
    </PageContent>
  );
}
