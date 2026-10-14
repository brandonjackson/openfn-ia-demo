import { Fragment, type ReactNode } from "react";
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

function TableTitle({ children, className = "pb-1" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`${className} leading-loose`}>
      <h6 className="font-normal text-black">{children}</h6>
    </div>
  );
}

function ProjectBadges({ ids }: { ids: string[] }) {
  return (
    <>
      {projectNames(ids).map((name) => (
        <Fragment key={name}>
          <span className="inline-flex items-center rounded-md bg-primary-50 p-1 my-0.5 text-xs font-medium ring-1 ring-inset ring-gray-500/10">
            {name}
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}

function Code({ children }: { children: string }) {
  return (
    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded truncate inline-block max-w-full" title={children}>
      {children}
    </code>
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
      <TableTitle className="pb-2">OAuth Clients</TableTitle>
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
              <Th>
                <span className="sr-only">Actions</span>
              </Th>
            </Tr>
          }
        >
          {rows.map((client) => (
            <Tr key={client.id} id={`oauth-clients-${client.id}`}>
              <Td className="wrap-break-word max-w-[15rem]">{client.name}</Td>
              {showOwner && (
                <Td className="wrap-break-word max-w-[15rem]">{client.global ? "GLOBAL" : ownerEmail(client.ownerId)}</Td>
              )}
              <Td className="wrap-break-word max-w-[20rem]">
                <ProjectBadges ids={client.projectIds} />
              </Td>
              <Td className="wrap-break-word max-w-[18rem]">{client.authorizationEndpoint}</Td>
              <Td>
                <div className="flex justify-end items-center">{actions?.(client)}</div>
              </Td>
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
              <Th>
                <span className="sr-only">Actions</span>
              </Th>
            </Tr>
          }
        >
          {rows.map((credential) => (
            <Tr key={credential.id} id={`credentials-${credential.id}`}>
              <Td className="max-w-[15rem]">
                <div className="flex items-center">
                  {credential.name}
                  {missingOauthClient(credential) && (
                    <span title="OAuth client not found">
                      <span className="hero-exclamation-triangle h-5 w-5 ml-2" />
                    </span>
                  )}
                </div>
              </Td>
              <Td className="wrap-break-word max-w-[10rem]">{credentialTypeLabel(credential)}</Td>
              {showOwner && (
                <Td className="wrap-break-word max-w-[15rem]">
                  <div className="flex-auto items-center">{ownerEmail(credential.ownerId)}</div>
                </Td>
              )}
              <Td className="wrap-break-word max-w-[25rem]">
                <ProjectBadges ids={credential.projectIds} />
              </Td>
              <Td className="wrap-break-word max-w-[12rem]">
                {credential.externalId ? <Code>{credential.externalId}</Code> : <span className="text-gray-400 text-sm">-</span>}
              </Td>
              <Td className="text-left">
                <span className="text-base cursor-default text-gray-700" title={credential.environments.join(", ")}>
                  {credential.environments.length}
                </span>
              </Td>
              <Td>
                <div className="flex justify-end items-center">{actions?.(credential)}</div>
              </Td>
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
              <Th>
                <span className="sr-only">Actions</span>
              </Th>
            </Tr>
          }
        >
          {rows.map((kc) => {
            const fallback = credentials.find((c) => c.id === kc.defaultCredentialId);
            return (
              <Tr key={kc.id} id={`keychain-credentials-${kc.id}`}>
                <Td className="max-w-[15rem]">{kc.name}</Td>
                <Td className="wrap-break-word max-w-[25rem]">
                  <Code>{kc.path}</Code>
                </Td>
                <Td className="wrap-break-word max-w-[15rem]">
                  {fallback ? fallback.name : <span className="text-gray-400 text-sm">None</span>}
                </Td>
                {showOwner && (
                  <Td className="wrap-break-word max-w-[15rem]">
                    <div className="flex-auto items-center">{ownerEmail(kc.createdById)}</div>
                  </Td>
                )}
                <Td>
                  <div className="flex justify-end items-center">{actions?.(kc)}</div>
                </Td>
              </Tr>
            );
          })}
        </Table>
      )}
    </div>
  );
}
