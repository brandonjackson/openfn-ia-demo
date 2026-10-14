import type { ReactNode } from "react";
import Heading from "../Heading";
import Pill from "../Pill";
import { Table, Td, Th, Tr } from "../Table";
import {
  credentialTypeLabel,
  credentials as allCredentials,
  missingOauthClient,
  ownerEmail,
  projectNames,
  type Credential,
  type KeychainCredential,
  type OauthClient,
} from "../../mock-data/credentials";

/**
 * The three tables of the credential index (live/components/data_tables.ex):
 * a plain title, then either the table or the empty state passed in.
 */

function TableTitle({ children }: { children: ReactNode }) {
  return (
    <Heading as="h6" className="mb-2">
      {children}
    </Heading>
  );
}

function ProjectBadges({ ids }: { ids: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {projectNames(ids).map((name) => (
        <Pill key={name} color="primary" square>
          {name}
        </Pill>
      ))}
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <Pill mono square title={children}>
      {children}
    </Pill>
  );
}

interface TableProps<T> {
  rows: T[];
  showOwner?: boolean;
  /** Rendered instead of the table when there are no rows. */
  emptyState: ReactNode;
  /** Last-column content per row (the Actions dropdown). */
  actions?: (row: T) => ReactNode;
}

export function OauthClientsTable({ rows, showOwner = false, emptyState, actions }: TableProps<OauthClient>) {
  return (
    <div id="oauth-clients-table-container">
      <TableTitle>OAuth Clients</TableTitle>
      {rows.length === 0 ? (
        emptyState
      ) : (
        <Table
          id="oauth-clients-table"
          header={
            <Tr>
              <Th>Name</Th>
              {showOwner && <Th>Owner</Th>}
              <Th>Projects With Access</Th>
              <Th>Authorization URL</Th>
              <Th actions />
            </Tr>
          }
        >
          {rows.map((client) => (
            <Tr key={client.id} id={`oauth-clients-${client.id}`}>
              <Td className="wrap-break-word max-w-60">{client.name}</Td>
              {showOwner && (
                <Td className="wrap-break-word max-w-60">{client.global ? "GLOBAL" : ownerEmail(client.ownerId)}</Td>
              )}
              <Td className="wrap-break-word max-w-80">
                <ProjectBadges ids={client.projectIds} />
              </Td>
              <Td className="wrap-break-word max-w-72">{client.authorizationEndpoint}</Td>
              <Td actions>{actions?.(client)}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  );
}

export function CredentialsTable({ rows, showOwner = false, emptyState, actions }: TableProps<Credential>) {
  return (
    <div id="credentials-table-container">
      <TableTitle>Credentials</TableTitle>
      {rows.length === 0 ? (
        emptyState
      ) : (
        <Table
          id="credentials-table"
          header={
            <Tr>
              <Th>Name</Th>
              <Th>Type</Th>
              {showOwner && <Th>Owner</Th>}
              <Th>Projects with access</Th>
              <Th>External ID</Th>
              <Th>Environments</Th>
              <Th actions />
            </Tr>
          }
        >
          {rows.map((credential) => (
            <Tr key={credential.id} id={`credentials-${credential.id}`}>
              <Td className="wrap-break-word max-w-60">
                {credential.name}
                {missingOauthClient(credential) && (
                  <span title="OAuth client not found" className="hero-exclamation-triangle ml-2 h-5 w-5" />
                )}
              </Td>
              <Td className="wrap-break-word max-w-40">{credentialTypeLabel(credential)}</Td>
              {showOwner && (
                <Td className="wrap-break-word max-w-60">{ownerEmail(credential.ownerId)}</Td>
              )}
              <Td className="wrap-break-word max-w-100">
                <ProjectBadges ids={credential.projectIds} />
              </Td>
              <Td className="wrap-break-word max-w-48">
                {credential.externalId ? <Code>{credential.externalId}</Code> : <span className="text-gray-400">-</span>}
              </Td>
              <Td title={credential.environments.join(", ")}>{credential.environments.length}</Td>
              <Td actions>{actions?.(credential)}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  );
}

export function KeychainCredentialsTable({
  rows,
  showOwner = true,
  emptyState,
  actions,
  credentials = allCredentials,
}: TableProps<KeychainCredential> & { credentials?: Credential[] }) {
  return (
    <div id="keychain-credentials-table-container">
      <TableTitle>Keychain Credentials</TableTitle>
      {rows.length === 0 ? (
        emptyState
      ) : (
        <Table
          id="keychain-credentials-table"
          header={
            <Tr>
              <Th>Name</Th>
              <Th>Path</Th>
              <Th>Default Credential</Th>
              {showOwner && <Th>Owner</Th>}
              <Th actions />
            </Tr>
          }
        >
          {rows.map((kc) => {
            const fallback = credentials.find((c) => c.id === kc.defaultCredentialId);
            return (
              <Tr key={kc.id} id={`keychain-credentials-${kc.id}`}>
                <Td className="wrap-break-word max-w-60">{kc.name}</Td>
                <Td className="wrap-break-word max-w-100">
                  <Code>{kc.path}</Code>
                </Td>
                <Td className="wrap-break-word max-w-60">
                  {fallback ? fallback.name : <span className="text-gray-400">None</span>}
                </Td>
                {showOwner && (
                  <Td className="wrap-break-word max-w-60">{ownerEmail(kc.createdById)}</Td>
                )}
                <Td actions>{actions?.(kc)}</Td>
              </Tr>
            );
          })}
        </Table>
      )}
    </div>
  );
}
