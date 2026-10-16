import { Table, Td, Th, Tr } from "../Table";
import Button from "../Button";
import DateTime from "../DateTime";
import Heading from "../Heading";
import IconButton from "../IconButton";
import type { ApiToken } from "../../types/tokens";

/**
 * The personal access tokens table (tokens_live/index.html.heex): masked
 * token, created and last-used dates, and a trash link to the delete modal.
 * With no tokens, the fingerprint empty state follows the (header-only) table.
 */
export default function TokensTable({ tokens, onGenerate }: { tokens: ApiToken[]; onGenerate?: () => void }) {
  return (
    <>
      <Table
        id="tokens"
        header={
          <Tr>
            <Th>Token</Th>
            <Th>Created on</Th>
            <Th>Last Used at</Th>
          </Tr>
        }
      >
        {tokens.map((token) => (
          <Tr key={token.id} id={`tokens-${token.id}`}>
            <Td>
              <code className="whitespace-nowrap">{token.masked}</code>
            </Td>
            <Td className="whitespace-nowrap font-medium">
              <DateTime value={token.insertedAt} />
            </Td>
            <Td>
              <div className="flex items-center justify-between whitespace-nowrap font-medium">
                {token.lastUsedAt ? <DateTime value={token.lastUsedAt} /> : "Never used"}
                <IconButton
                  id={`delete-token-${token.id}`}
                  to={`/profile/tokens/${token.id}/delete`}
                  icon="hero-trash"
                  tone="danger"
                  label="Delete token"
                  className="-my-1"
                />
              </div>
            </Td>
          </Tr>
        ))}
      </Table>
      {tokens.length === 0 && (
        <div className="flex items-center gap-2 p-4">
          <span className="hero-finger-print h-12 w-12" />
          <div className="flex-1">
            <Heading size="sm">No Personal Access Tokens</Heading>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new access token.</p>
          </div>
          <Button id="generate_new_token" onClick={onGenerate}>
            <span className="hero-plus h-5 w-5" />
            Generate New Token
          </Button>
        </div>
      )}
    </>
  );
}
