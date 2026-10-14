import { Link } from "react-router-dom";
import { Table, Td, Th, Tr } from "../Table";
import Button from "../Button";
import RelativeTime from "../projects/RelativeTime";
import { maskToken, type ApiToken } from "../../mock-data/tokens";

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
              <code className="my-auto whitespace-nowrap align-baseline leading-none">
                <span>{maskToken(token)}</span>
              </code>
            </Td>
            <Td>
              <span className="my-auto whitespace-nowrap text-center align-baseline font-medium leading-none">
                <RelativeTime datetime={token.insertedAt} />
              </span>
            </Td>
            <Td>
              <div className="flex content-center justify-between">
                <span className="my-auto whitespace-nowrap text-center align-baseline font-medium leading-none">
                  {token.lastUsedAt ? <RelativeTime datetime={token.lastUsedAt} /> : "Never used"}
                </span>
                <Link id={`delete-token-${token.id}`} to={`/profile/tokens/${token.id}/delete`} className="text-red-600">
                  <span className="hero-trash w-5 h-5" />
                </Link>
              </div>
            </Td>
          </Tr>
        ))}
      </Table>
      {tokens.length === 0 && (
        <div className="flex justify-between items-center">
          <div className="flex content-center gap-2">
            <div>
              <span className="hero-finger-print h-12 w-12 text-black" />
            </div>
            <div>
              <h3 className="mt-1 text-sm font-semibold text-gray-900">No Personal Access Tokens</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new access token.</p>
            </div>
          </div>
          <div className="my-auto p-4 text-right">
            <Button id="generate_new_token" onClick={onGenerate} className="inline-flex items-center gap-x-1.5">
              <span className="hero-plus -ml-0.5 h-5 w-5" />
              <span className="inline-block align-middle">Generate New Token</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
