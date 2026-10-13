import { useState } from "react";
import {
  Settings,
  KeyRound,
  ShieldAlert,
  Users,
  ShieldCheck,
  GitBranch,
  Database,
  Download,
  Trash2,
  Lock,
} from "lucide-react";
import type { IANode } from "../ia-tree";
import type { Collaborator, OrgCredential, ProjectSettingsPageData } from "../page-data";
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
import { TextInput, TextArea, Select, RadioOption } from "../components/FormControls";
import ToggleSwitch from "../components/ToggleSwitch";
import DataTable from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";

/* ------------------------------------------------------------------ */
/*  Section menu                                                       */
/* ------------------------------------------------------------------ */

const navItems: SettingsNavItem[] = [
  { id: "setup", label: "Setup", icon: Settings },
  { id: "credentials", label: "Credentials", icon: KeyRound },
  { id: "webhook-security", label: "Webhook Security", icon: ShieldAlert },
  { id: "collaboration", label: "Collaboration", icon: Users },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "sync-to-github", label: "Sync to Github", icon: GitBranch },
  { id: "data-storage", label: "Data Storage", icon: Database },
  { id: "history-exports", label: "History Exports", icon: Download },
];

/* ------------------------------------------------------------------ */
/*  Setup section                                                      */
/* ------------------------------------------------------------------ */

function SetupSection({ data }: { data: ProjectSettingsPageData }) {
  return (
    <div className="space-y-8">
      <SectionHeading
        title="Project setup"
        description="Projects are isolated workspaces that contain workflows, accessible to certain users."
      />

      <Card
        title="Project Identity"
        description="This metadata helps you identify the types of workflows managed in this project and the people that have access."
      >
        <div className="space-y-4">
          <FormField label="Project name" htmlFor="project-name" hint={`Your project will be named ${data.projectName}.`}>
            <TextInput id="project-name" defaultValue={data.projectName} />
          </FormField>

          <FormField
            label="Project environment"
            htmlFor="project-environment"
            hint="Credentials will be loaded with values from this environment."
          >
            <TextInput id="project-environment" defaultValue={data.projectEnvironment} />
          </FormField>

          <FormField
            label="Project description"
            htmlFor="project-description"
            hint="A short description of a project (max 240 characters)"
          >
            <TextArea id="project-description" defaultValue={data.projectDescription} maxLength={240} rows={3} />
          </FormField>

          <div className="flex justify-end">
            <Button>Save</Button>
          </div>
        </div>
      </Card>

      <Card
        title="Concurrency Override"
        description={
          <>
            <p>
              By default, runs are executed concurrently in accordance to limits set on individual workflows.
              In some situations, you may want to prevent concurrent execution across all workflows in a project.
            </p>
            <p>
              Disabling parallel run execution ensures that only one run is executed at a time, regardless of workflow, for this entire project.
            </p>
          </>
        }
      >
        <div className="flex items-center justify-between rounded-md bg-gray-50 border border-gray-200 px-4 py-3">
          <ToggleSwitch checked={data.concurrencyDisabled} label="Disable parallel execution" />
          <Badge label="Not allowed on Free plans" icon={Lock} />
        </div>

        <div className="mt-4 flex justify-end">
          <Button>Save</Button>
        </div>
      </Card>

      <Card
        title="Export your Project"
        description="Export your project as code, to save this version or edit your project locally."
      >
        <Button variant="secondary">Export project</Button>
      </Card>

      <Callout variant="danger" title="The danger zone">
        <p>Deleting your project is irreversible</p>
        <Button variant="danger" icon={Trash2}>
          Delete project
        </Button>
      </Callout>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Credentials section                                                */
/* ------------------------------------------------------------------ */

const credentialColumns: DataTableColumn<OrgCredential>[] = [
  { key: "name", header: "Name", render: (c) => <span className="font-medium text-gray-900">{c.name}</span> },
  { key: "system", header: "System", render: (c) => c.system },
  { key: "environment", header: "Environment", render: (c) => <EnvironmentBadge environment={c.environment} /> },
  { key: "owner", header: "Owner", render: (c) => c.owner },
  {
    key: "access",
    header: "Access",
    render: (c) => (c.hasAccess ? <Badge label="Granted" tone="green" /> : <Badge label="No access" />),
  },
  {
    key: "actions",
    header: "",
    align: "right",
    render: (c) =>
      !c.hasAccess && (
        <Button variant="outline-primary" size="xs">
          Request access
        </Button>
      ),
  },
];

function CredentialsSection({ data }: { data: ProjectSettingsPageData }) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Credentials"
        description="Manage credentials available to this project. Each credential belongs to one environment: production, staging or mock."
        action={
          <Button
            variant="secondary"
            size="sm"
            disabled
            title="User credentials are being phased out, please add credentials at the org level."
          >
            Add Private Credential
          </Button>
        }
      />

      <DataTable columns={credentialColumns} rows={data.orgCredentials} getRowKey={(c) => c.id} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Webhook Security section                                           */
/* ------------------------------------------------------------------ */

function WebhookSecuritySection() {
  return (
    <div className="space-y-6">
      <SectionHeading title="Webhook Security" />

      <Callout variant="warning" title="Deprecation Notice">
        Webhook security settings have moved to your personal vault. Please configure webhook secrets there instead.
      </Callout>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Collaboration section                                              */
/* ------------------------------------------------------------------ */

const collaboratorColumns: DataTableColumn<Collaborator>[] = [
  {
    key: "collaborator",
    header: "Collaborator",
    render: (c) => (
      <div>
        <div className="text-sm font-medium text-gray-900">{c.name}</div>
        <div className="text-xs text-gray-500">{c.email}</div>
        {c.isSelf && <div className="text-xs text-blue-500 mt-0.5">Well hello, you!</div>}
      </div>
    ),
  },
  { key: "role", header: "Role", render: (c) => <span className="text-gray-700">{c.role}</span> },
  { key: "failure-alert", header: "Failure Alert", render: (c) => c.failureAlert },
  { key: "digest", header: "Digest", render: (c) => c.digest },
  {
    key: "actions",
    header: "",
    align: "right",
    render: () => <Button variant="link-danger">Remove collaborator</Button>,
  },
];

function CollaborationSection({ data }: { data: ProjectSettingsPageData }) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Project collaboration"
        description="View collaborators and manage alert settings for this project."
        action={<Button size="sm">Add collaborator(s)</Button>}
      />

      <DataTable columns={collaboratorColumns} rows={data.collaborators} getRowKey={(c) => c.email} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Security section                                                   */
/* ------------------------------------------------------------------ */

function SecuritySection({ data }: { data: ProjectSettingsPageData }) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Project security"
        description="View and manage security settings for this project."
      />

      <Card
        title="Multi-Factor Authentication"
        description="Requiring multi-factor authentication (MFA) adds an additional layer of security by requiring users to enable MFA on their accounts before they are allowed access this project."
      >
        <ToggleSwitch
          checked={data.mfaRequired}
          label={`Require MFA? (currently ${data.mfaRequired ? "required" : "optional"} for this project)`}
        />
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sync to Github section                                             */
/* ------------------------------------------------------------------ */

function SyncToGithubSection({ data }: { data: ProjectSettingsPageData }) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Version control"
        description="View or modify external version control settings for this project."
      />

      {data.githubConnected ? (
        <Callout variant="success" title="GitHub account connected" icon={GitBranch} />
      ) : (
        <Card
          title="Connect your OpenFn account to GitHub"
          description="To create a new GitHub version control connection you must first connect your OpenFn account to GitHub. Please click the button below to get started."
        >
          <Button variant="dark" icon={GitBranch}>
            Connect your GitHub account
          </Button>
          <p className="mt-3 text-xs text-gray-400">
            Need to learn more about GitHub Sync? See portability docs for full documentation on
            associated GitHub actions and automated workflows.
          </p>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data Storage section                                               */
/* ------------------------------------------------------------------ */

const retentionOptions = ["7 Days", "14 Days", "30 Days", "90 Days", "180 Days", "1 Year"];

function DataStorageSection({ data }: { data: ProjectSettingsPageData }) {
  const [ioPolicy, setIoPolicy] = useState(data.ioDataPolicy);

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Data storage"
        description="View or modify data storage settings for this project."
      />

      <Card
        title="History Retention Period"
        description="Select how long your run history is stored in OpenFn before being removed from the servers. This includes all Work Orders, Runs, and Logs."
      >
        <Select options={retentionOptions} defaultValue={data.retentionPeriod} />
        <p className="mt-2 text-xs text-gray-400">
          Retention periods cannot be configured for projects on the free plan.
        </p>
      </Card>

      <Card title="Input/Output Data Storage Policy" description="Should OpenFn store input/output data for workflow runs?">
        <div className="space-y-2">
          <RadioOption
            name="io-policy"
            value="retain"
            label="Retain input/output data for all workflow runs"
            checked={ioPolicy === "retain"}
            onChange={() => setIoPolicy("retain")}
          />
          <RadioOption
            name="io-policy"
            value="zero-persistence"
            label="Never retain input/output data (zero-persistence)"
            checked={ioPolicy === "zero-persistence"}
            onChange={() => setIoPolicy("zero-persistence")}
          />
        </div>
      </Card>

      {ioPolicy === "retain" && (
        <Card
          title="Input/Output Data Retention Period"
          description="Select how long input/output data is stored. Once input/output data is removed for a given run, you will no longer be able to retry that run."
        >
          <Select options={retentionOptions} defaultValue={data.ioRetentionPeriod} />
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="secondary">Cancel</Button>
        <Button>Save</Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  History Exports section                                            */
/* ------------------------------------------------------------------ */

function HistoryExportsSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="History exports"
        description="View export status and download work order history for this project."
      />

      <EmptyState
        icon={Download}
        title="No exports yet."
        description="Export your work order history to download it as a file."
        action={<Button>Create export</Button>}
      />
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
  data: ProjectSettingsPageData;
}

export default function ProjectSettingsTemplate({ node, ancestors, data }: Props) {
  const [activeTab, setActiveTab] = useState("setup");

  const projectLabel = ancestors.length > 0
    ? ancestors[ancestors.length - 1].node.label
    : "Project";

  return (
    <SettingsLayout
      breadcrumbs={{
        ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
        current: node.label,
      }}
      title={`${projectLabel} Settings`}
      description="Manage settings and configuration for this project."
      navItems={navItems}
      activeId={activeTab}
      onSelect={setActiveTab}
    >
      {activeTab === "setup" && <SetupSection data={data} />}
      {activeTab === "credentials" && <CredentialsSection data={data} />}
      {activeTab === "webhook-security" && <WebhookSecuritySection />}
      {activeTab === "collaboration" && <CollaborationSection data={data} />}
      {activeTab === "security" && <SecuritySection data={data} />}
      {activeTab === "sync-to-github" && <SyncToGithubSection data={data} />}
      {activeTab === "data-storage" && <DataStorageSection data={data} />}
      {activeTab === "history-exports" && <HistoryExportsSection />}
    </SettingsLayout>
  );
}
