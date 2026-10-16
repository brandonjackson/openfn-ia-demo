import Header from "../../components/Header";
import Button from "../../components/Button";
import { Centered, PageContent } from "../../components/PageContent";
import NewTokenBanner from "../../components/profile/NewTokenBanner";
import TokensTable from "../../components/profile/TokensTable";
import TokenDeletionModal from "../../components/profile/TokenDeletionModal";
import { useToast } from "../../components/Toast";
import type { ApiToken } from "../../types/tokens";
import { errorMessage } from "../../utils/errors";
import { useAction } from "../../utils/useAction";

/** The contract between this page and whatever feeds it (the replica wrapper, later Lightning). */
export interface TokensPageProps {
  /** The signed-in user's tokens, newest first, as the server lists them. */
  tokens: ApiToken[];
  /** The full secret of the token just generated, shown once in the banner; otherwise null. */
  newToken: string | null;
  /** The token whose delete modal is open (/profile/tokens/:tokenId/delete); otherwise null. */
  tokenId: string | null;
  /** Generates a token. Rejects on failure, which the page toasts. */
  onGenerate: () => Promise<void>;
  /** Deletes a token. Rejects on failure, which the modal shows inline. */
  onDelete: (id: string) => Promise<void>;
  /** Closes the delete modal, after a delete or on Cancel. */
  onClose: () => void;
}

/**
 * Inventory view `profile-tokens` (tokens_live/index.html.heex): "Generate
 * New Token" shows the new token once in a banner; the table masks the rest.
 * Props only, so it can run unchanged in Lightning; the replica's data and
 * routing live in TokensPage.replica.tsx.
 */
export default function TokensPage({ tokens, newToken, tokenId, onGenerate, onDelete, onClose }: TokensPageProps) {
  const toast = useToast();
  const generate = useAction(onGenerate, { onError: (e) => toast(errorMessage(e), "error") });

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
          <TokenDeletionModal onClose={onClose} onDelete={() => onDelete(tokenId)} />
        )}
        {newToken && <NewTokenBanner token={newToken} />}
        <TokensTable tokens={tokens} onGenerate={() => generate.run()} />
      </Centered>
    </PageContent>
  );
}
