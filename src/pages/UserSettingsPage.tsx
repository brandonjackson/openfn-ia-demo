import { useState } from "react";
import Link from "../components/primitives/Link";
import {
  UserCircle,
  KeyRound,
  Terminal,
  Plus,
  Trash2,
  Copy,
  GitBranch,
  ShieldCheck,
  Fingerprint,
} from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { ApiToken, OAuthClient, UserCredential, UserProfile, UserSettingsPageData } from "../model/page-data";
import SettingsLayout from "../components/patterns/SettingsLayout";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import type { SettingsNavItem } from "../components/patterns/SettingsNav";
import SectionHeading from "../components/primitives/SectionHeading";
import Card from "../components/primitives/Card";
import Button from "../components/primitives/Button";
import Badge from "../components/primitives/Badge";
import EnvironmentBadge from "../components/domain/EnvironmentBadge";
import Callout from "../components/primitives/Callout";
import EmptyState from "../components/primitives/EmptyState";
import FormField from "../components/primitives/FormField";
import { TextInput, Select } from "../components/primitives/FormControls";
import DataTable from "../components/primitives/DataTable";
import type { DataTableColumn } from "../components/primitives/DataTable";
import SystemLabel from "../components/domain/SystemLabel";

/* ------------------------------------------------------------------ */
/*  Section menu                                                       */
/* ------------------------------------------------------------------ */

const BASE_PATH = "/user-settings";

const navItems: SettingsNavItem[] = [
  { id: "profile", label: "Profile", icon: UserCircle, to: `${BASE_PATH}/profile` },
  { id: "credentials", label: "Credentials", icon: KeyRound, to: `${BASE_PATH}/credentials` },
  { id: "api-tokens", label: "API tokens", icon: Terminal, to: `${BASE_PATH}/api-tokens` },
];

/* ------------------------------------------------------------------ */
/*  Profile section                                                    */
/* ------------------------------------------------------------------ */

function ProfileSection({ profile }: { profile: UserProfile }) {
  return (
    <div className="space-y-8">
      <SectionHeading
        title={`${profile.firstName} ${profile.lastName}`}
        description={`${profile.email} · Member since ${profile.createdAt}`}
      />

      <Card title="Basic information" description="Change your name and how often we contact you.">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First name" htmlFor="first-name">
              <TextInput id="first-name" defaultValue={profile.firstName} autoComplete="given-name" />
            </FormField>
            <FormField label="Last name" htmlFor="last-name">
              <TextInput id="last-name" defaultValue={profile.lastName} autoComplete="family-name" />
            </FormField>
          </div>
          <FormField
            label="Contact preference"
            htmlFor="contact-preference"
            hint="Choose 'Anytime' to hear about everything, or 'Critical only' for issues affecting your projects and account."
          >
            <Select
              id="contact-preference"
              options={["Anytime", "Critical only"]}
              defaultValue={profile.contactPreference}
            />
          </FormField>
          <div className="flex justify-end">
            <Button>Save</Button>
          </div>
        </div>
      </Card>

      <Card title="Change email" description="We'll send a confirmation link to the new address.">
        <div className="space-y-4">
          <FormField label="New email address" htmlFor="new-email">
            <TextInput id="new-email" type="email" placeholder={profile.email} />
          </FormField>
          <FormField label="Enter password to confirm" htmlFor="email-password">
            <TextInput id="email-password" type="password" autoComplete="current-password" />
          </FormField>
          <div className="flex justify-end">
            <Button>Update email</Button>
          </div>
        </div>
      </Card>

      <Card title="Change password" description="Confirm your current password to set a new one.">
        <div className="space-y-4">
          <FormField label="New password" htmlFor="new-password">
            <TextInput id="new-password" type="password" autoComplete="new-password" />
          </FormField>
          <FormField label="Confirm new password" htmlFor="confirm-password">
            <TextInput id="confirm-password" type="password" autoComplete="new-password" />
          </FormField>
          <FormField label="Current password" htmlFor="current-password">
            <TextInput id="current-password" type="password" autoComplete="current-password" />
          </FormField>
          <div className="flex justify-end">
            <Button>Update password</Button>
          </div>
        </div>
      </Card>

      <Card
        title="Multi-factor authentication"
        description="Add a second step to sign in with an authenticator app. Some projects require it."
      >
        {profile.mfaEnabled ? (
          <div className="flex items-center justify-between">
            <Badge label="Enabled" tone="green" icon={ShieldCheck} />
            <Button variant="secondary">Disable MFA</Button>
          </div>
        ) : (
          <Button icon={ShieldCheck}>Set up MFA</Button>
        )}
      </Card>

      <Card
        title="GitHub access"
        description="Link your GitHub account to manage version control across your projects."
      >
        {profile.githubConnected ? (
          <div className="flex items-center justify-between">
            <Badge label="Connected" tone="green" icon={GitBranch} />
            <Button variant="secondary">Disconnect from GitHub</Button>
          </div>
        ) : (
          <Button variant="dark" icon={GitBranch}>
            Connect your GitHub account
          </Button>
        )}
      </Card>

      <Callout variant="danger" title="Delete account">
        <p>Deleting your account is irreversible.</p>
        <Button variant="danger" icon={Trash2}>
          Delete my account
        </Button>
      </Callout>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Credentials section                                                */
/* ------------------------------------------------------------------ */

const credentialColumns: DataTableColumn<UserCredential>[] = [
  { key: "name", header: "Name", render: (c) => <span className="font-medium text-gray-900">{c.name}</span> },
  { key: "type", header: "Type", render: (c) => c.type },
  { key: "projects", header: "Projects", render: (c) => c.projects.join(", ") || "—" },
  {
    key: "env",
    header: "Environment",
    render: (c) => <EnvironmentBadge environment={c.environment} />,
  },
  { key: "created", header: "Created", render: (c) => c.createdAt },
  {
    key: "actions",
    header: "",
    align: "right",
    render: () => (
      <Button variant="outline-danger" size="xs" icon={Trash2}>
        Delete
      </Button>
    ),
  },
];

const oauthColumns: DataTableColumn<OAuthClient>[] = [
  { key: "name", header: "Name", render: (c) => <span className="font-medium text-gray-900">{c.name}</span> },
  { key: "system", header: "System", render: (c) => <SystemLabel name={c.system} /> },
  { key: "scope", header: "Available to", render: (c) => <Badge label={c.scope} tone={c.scope === "Global" ? "indigo" : "gray"} /> },
  {
    key: "actions",
    header: "",
    align: "right",
    render: () => (
      <Button variant="outline-danger" size="xs" icon={Trash2}>
        Delete
      </Button>
    ),
  },
];

function CredentialsSection({ data }: { data: UserSettingsPageData }) {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <SectionHeading
          title="Credentials"
          description="Credentials you own. Share them with any project you collaborate on."
          action={
            <Button size="sm" icon={Plus}>
              New credential
            </Button>
          }
        />

        {(data.orgCredentialsOnSystems ?? true) && (
          <Callout variant="info" title="Organization credentials live in Systems">
            Credentials your whole organization shares are managed on each{" "}
            <Link to="/connected-systems" className="underline font-medium">
              connected system
            </Link>
            .
          </Callout>
        )}

        <DataTable
          columns={credentialColumns}
          rows={data.credentials}
          getRowKey={(c) => c.id}
          emptyMessage="You don't own any credentials yet."
        />
      </div>

      <div>
        <SectionHeading
          title="OAuth clients"
          description="Apps registered with external systems so credentials can sign in with OAuth."
          action={
            <Button variant="secondary" size="sm" icon={Plus}>
              New OAuth client
            </Button>
          }
        />
        <DataTable
          columns={oauthColumns}
          rows={data.oauthClients}
          getRowKey={(c) => c.id}
          emptyMessage="No OAuth clients yet."
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  API tokens section                                                 */
/* ------------------------------------------------------------------ */

interface TokenActions {
  /** Generates a personal access token and resolves with it: the only time it's ever shown. */
  onGenerateToken: () => Promise<string>;
  /** Deletes a token, so it stops working. */
  onDeleteToken: (id: string) => Promise<void>;
}

function ApiTokensSection({ data, onGenerateToken, onDeleteToken }: { data: UserSettingsPageData } & TokenActions) {
  const tokens = data.apiTokens;
  const [newToken, setNewToken] = useState<string | null>(null);

  const generate = async () => {
    setNewToken(await onGenerateToken());
  };

  const columns: DataTableColumn<ApiToken>[] = [
    {
      key: "token",
      header: "Token",
      render: (t) => <code className="font-mono text-gray-900">••••••••••••{t.suffix}</code>,
    },
    { key: "created", header: "Created on", render: (t) => t.createdAt },
    { key: "last-used", header: "Last used", render: (t) => t.lastUsedAt ?? "Never used" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (t) => (
        <Button
          variant="outline-danger"
          size="xs"
          icon={Trash2}
          aria-label="Delete token"
          onClick={() => void onDeleteToken(t.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeading
        title="API tokens"
        description="Personal access tokens let the OpenFn CLI and API act as you."
        action={
          <Button size="sm" icon={Plus} onClick={generate}>
            Generate new token
          </Button>
        }
      />

      {newToken && (
        <Callout variant="warning" title="Copy your token now. You won't be able to see it again.">
          <div className="flex gap-2">
            <TextInput readOnly value={newToken} aria-label="New token" className="font-mono" />
            <Button variant="secondary" icon={Copy} onClick={() => navigator.clipboard?.writeText(newToken)}>
              Copy
            </Button>
          </div>
        </Callout>
      )}

      {tokens.length > 0 ? (
        <DataTable columns={columns} rows={tokens} getRowKey={(t) => t.id} />
      ) : (
        <EmptyState
          icon={Fingerprint}
          title="No personal access tokens"
          description="Get started by creating a new access token."
          action={
            <Button icon={Plus} onClick={generate}>
              Generate new token
            </Button>
          }
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main template                                                      */
/* ------------------------------------------------------------------ */

export interface UserSettingsPageProps extends PageProps<UserSettingsPageData>, TokenActions {}

export default function UserSettingsPage({ node, ancestors, data, onGenerateToken, onDeleteToken }: UserSettingsPageProps) {
  // The /user-settings root shows the first section.
  const activeId = navItems.some((item) => item.id === node.id) ? node.id : navItems[0].id;

  return (
    <SettingsLayout
      breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
      title="User settings"
      description="Manage your profile, personal credentials and API tokens."
      navItems={navItems}
      activeId={activeId}
    >
      {activeId === "profile" && <ProfileSection profile={data.profile} />}
      {activeId === "credentials" && <CredentialsSection data={data} />}
      {activeId === "api-tokens" && (
        <ApiTokensSection data={data} onGenerateToken={onGenerateToken} onDeleteToken={onDeleteToken} />
      )}
    </SettingsLayout>
  );
}
