import { useState } from "react";
import { Link } from "react-router-dom";
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
import type { IANode } from "../ia-tree";
import type {
  ApiToken,
  OAuthClient,
  UserCredential,
  UserProfile,
  UserSettingsPageData,
} from "../page-data";
import SettingsLayout from "../components/SettingsLayout";
import type { SettingsNavItem } from "../components/SettingsNav";
import SectionHeading from "../components/SectionHeading";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import EnvironmentBadge from "../components/EnvironmentBadge";
import Callout from "../components/Callout";
import EmptyState from "../components/EmptyState";
import FormField from "../components/FormField";
import { TextInput, Select } from "../components/FormControls";
import DataTable from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";

/* ------------------------------------------------------------------ */
/*  Section menu                                                       */
/* ------------------------------------------------------------------ */

const BASE_PATH = "/user-settings";

const navItems: SettingsNavItem[] = [
  { id: "profile", label: "Profile", icon: UserCircle, to: `${BASE_PATH}/profile` },
  { id: "credentials", label: "Credentials", icon: KeyRound, to: `${BASE_PATH}/credentials` },
  { id: "api-tokens", label: "API Tokens", icon: Terminal, to: `${BASE_PATH}/api-tokens` },
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

      <Card title="Change password">
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
    render: () => <Button variant="link-danger">Delete</Button>,
  },
];

const oauthColumns: DataTableColumn<OAuthClient>[] = [
  { key: "name", header: "Name", render: (c) => <span className="font-medium text-gray-900">{c.name}</span> },
  { key: "system", header: "System", render: (c) => c.system },
  { key: "scope", header: "Available to", render: (c) => <Badge label={c.scope} tone={c.scope === "Global" ? "blue" : "gray"} /> },
  {
    key: "actions",
    header: "",
    align: "right",
    render: () => <Button variant="link-danger">Delete</Button>,
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

        <Callout variant="info" title="Organisation credentials live in Systems">
          Credentials your whole organisation shares are managed on each{" "}
          <Link to="/connected-systems" className="underline font-medium">
            connected system
          </Link>
          .
        </Callout>

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

function fakeToken() {
  const hex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `ofn_pat_demo_${hex}`;
}

function ApiTokensSection({ data }: { data: UserSettingsPageData }) {
  const [tokens, setTokens] = useState<ApiToken[]>(data.apiTokens);
  const [newToken, setNewToken] = useState<string | null>(null);

  const generate = () => {
    const token = fakeToken();
    setNewToken(token);
    setTokens([{ id: `tok-${Date.now()}`, suffix: token.slice(-4), createdAt: "Just now" }, ...tokens]);
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
          variant="link-danger"
          icon={Trash2}
          aria-label="Delete token"
          onClick={() => setTokens(tokens.filter((x) => x.id !== t.id))}
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

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: UserSettingsPageData;
}

export default function UserSettingsTemplate({ node, ancestors, data }: Props) {
  // The /user-settings root shows the first section.
  const activeId = navItems.some((item) => item.id === node.id) ? node.id : navItems[0].id;

  return (
    <SettingsLayout
      breadcrumbs={{
        ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
        current: node.label,
      }}
      title="User Settings"
      description="Manage your profile, personal credentials and API tokens."
      navItems={navItems}
      activeId={activeId}
    >
      {activeId === "profile" && <ProfileSection profile={data.profile} />}
      {activeId === "credentials" && <CredentialsSection data={data} />}
      {activeId === "api-tokens" && <ApiTokensSection data={data} />}
    </SettingsLayout>
  );
}
