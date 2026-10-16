import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../components/Toast";
import { apiTokens, generateFakeToken } from "../../mock-data/tokens";
import { simulateRequest } from "../../mock-data/request";
import TokensPage from "./TokensPage";

/**
 * The replica's side of TokensPage: holds the fixtures in state as the
 * server would, reads the delete modal's token from the URL, and owns the
 * success toasts and navigation. Lightning will replace this file with a
 * LiveView wrapper; TokensPage stays as it is.
 */
export default function TokensPageReplica() {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [tokens, setTokens] = useState(apiTokens);
  const [newToken, setNewToken] = useState<string | null>(null);

  return (
    <TokensPage
      tokens={tokens}
      newToken={newToken}
      tokenId={tokenId ?? null}
      onGenerate={async () => {
        const { token, secret } = await simulateRequest(generateFakeToken());
        setTokens((list) => [token, ...list]);
        setNewToken(secret);
        toast("Token created successfully");
      }}
      onDelete={async (id) => {
        await simulateRequest();
        setTokens((list) => list.filter((t) => t.id !== id));
        toast("Token deleted successfully");
      }}
      onClose={() => navigate("/profile/tokens")}
    />
  );
}
