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
  AlertTriangle,
  Trash2,
  Info,
  Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ProjectSettingsPageData } from "../page-data";
import Breadcrumbs from "../components/Breadcrumbs";

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

const tabs: Tab[] = [
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
/*  Shared UI helpers                                                  */
/* ------------------------------------------------------------------ */

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-5 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
}

function SaveButton() {
  return (
    <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
      Save
    </button>
  );
}

function DisabledBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
      <Lock size={10} />
      {text}
    </span>
  );
}

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

      {/* Project Identity */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Project Identity</h3>
        <p className="text-xs text-gray-500 mb-4">
          This metadata helps you identify the types of workflows managed in this project and the people that have access.
        </p>

        <div className="space-y-4">
          <div>
            <Label>Project name</Label>
            <input
              type="text"
              defaultValue={data.projectName}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Your project will be named {data.projectName}.
            </p>
          </div>

          <div>
            <Label>Project environment</Label>
            <input
              type="text"
              defaultValue={data.projectEnvironment}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Credentials will be loaded with values from this environment.
            </p>
          </div>

          <div>
            <Label>Project description</Label>
            <textarea
              defaultValue={data.projectDescription}
              maxLength={240}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              A short description of a project (max 240 characters)
            </p>
          </div>

          <div className="flex justify-end">
            <SaveButton />
          </div>
        </div>
      </Card>

      {/* Concurrency Override */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Concurrency Override</h3>
        <p className="text-xs text-gray-500 mb-4">
          By default, runs are executed concurrently in accordance to limits set on individual workflows.
          In some situations, you may want to prevent concurrent execution across all workflows in a project.
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Disabling parallel run execution ensures that only one run is executed at a time, regardless of workflow, for this entire project.
        </p>

        <div className="flex items-center justify-between rounded-md bg-gray-50 border border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <ToggleSwitch checked={data.concurrencyDisabled} />
            <span className="text-sm text-gray-700">Disable parallel execution</span>
          </div>
          <DisabledBadge text="Not allowed on Free plans" />
        </div>

        <div className="mt-4 flex justify-end">
          <SaveButton />
        </div>
      </Card>

      {/* Export */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Export your Project</h3>
        <p className="text-xs text-gray-500 mb-4">
          Export your project as code, to save this version or edit your project locally.
        </p>
        <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Export project
        </button>
      </Card>

      {/* Danger Zone */}
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-red-500" />
          <h3 className="text-sm font-semibold text-red-700">The danger zone</h3>
        </div>
        <p className="text-xs text-red-600 mb-4">Deleting your project is irreversible</p>
        <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors inline-flex items-center gap-1.5">
          <Trash2 size={14} />
          Delete project
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Credentials section                                                */
/* ------------------------------------------------------------------ */

function CredentialsSection({ data }: { data: ProjectSettingsPageData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeading
          title="Credentials"
          description="Manage credentials available to this project."
        />
        <div className="relative group">
          <button
            disabled
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-400 cursor-not-allowed bg-gray-50"
          >
            Add Private Credential
          </button>
          <div className="absolute right-0 top-full mt-1 w-64 rounded-md bg-gray-800 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            User credentials are being phased out, please add credentials at the org level.
          </div>
        </div>
      </div>

      {/* Org Credentials Table */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.orgCredentials.map((cred) => (
              <tr key={cred.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{cred.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{cred.system}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{cred.owner}</td>
                <td className="px-4 py-3">
                  {cred.hasAccess ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Granted
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      No access
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {!cred.hasAccess && (
                    <button className="rounded-md border border-blue-300 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                      Request Access
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
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

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Deprecation Notice</h3>
            <p className="mt-1 text-sm text-amber-700">
              Webhook security settings have moved to your personal vault. Please configure webhook secrets there instead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Collaboration section                                              */
/* ------------------------------------------------------------------ */

function CollaborationSection({ data }: { data: ProjectSettingsPageData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeading
          title="Project collaboration"
          description="View collaborators and manage alert settings for this project."
        />
        <button className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Add Collaborator(s)
        </button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collaborator</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failure Alert</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Digest</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.collaborators.map((collab) => (
              <tr key={collab.email} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{collab.name}</div>
                    <div className="text-xs text-gray-500">{collab.email}</div>
                    {collab.isSelf && (
                      <div className="text-xs text-blue-500 mt-0.5">Well hello, you!</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{collab.role}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{collab.failureAlert}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{collab.digest}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                    Remove Collaborator
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
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

      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Multi-Factor Authentication</h3>
        <p className="text-xs text-gray-500 mb-4">
          Requiring multi-factor authentication (MFA) adds an additional layer of security by requiring
          users to enable MFA on their accounts before they are allowed access this project.
        </p>

        <div className="flex items-center gap-3">
          <ToggleSwitch checked={data.mfaRequired} />
          <span className="text-sm text-gray-700">
            Require MFA?{" "}
            <span className="text-gray-400">
              (currently {data.mfaRequired ? "required" : "optional"} for this project)
            </span>
          </span>
        </div>
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

      <Card>
        {data.githubConnected ? (
          <div className="flex items-center gap-2">
            <GitBranch size={18} className="text-gray-700" />
            <span className="text-sm text-green-700 font-medium">GitHub account connected</span>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GitBranch size={18} className="text-gray-700" />
              <h3 className="text-sm font-semibold text-gray-900">
                Connect your OpenFn account to GitHub
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              To create a new GitHub version control connection you must first connect your OpenFn
              account to GitHub. Please click the button below to get started.
            </p>
            <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors inline-flex items-center gap-2">
              <GitBranch size={14} />
              Connect your GitHub Account
            </button>
            <p className="mt-3 text-xs text-gray-400">
              Need to learn more about GitHub Sync? See portability docs for full documentation on
              associated GitHub actions and automated workflows.
            </p>
          </div>
        )}
      </Card>
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

      {/* History Retention */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">History Retention Period</h3>
        <p className="text-xs text-gray-500 mb-4">
          Select how long your run history is stored in OpenFn before being removed from the servers.{" "}
          This includes all Work Orders, Runs, and Logs.
        </p>

        <select
          defaultValue={data.retentionPeriod}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {retentionOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <p className="mt-2 text-xs text-gray-400">
          Retention periods cannot be configured for projects on the free plan.
        </p>
      </Card>

      {/* I/O Data Storage Policy */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Input/Output Data Storage Policy</h3>
        <p className="text-xs text-gray-500 mb-4">
          Should OpenFn store input/output data for workflow runs?
        </p>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="io-policy"
              value="retain"
              checked={ioPolicy === "retain"}
              onChange={() => setIoPolicy("retain")}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700">Retain input/output data for all workflow runs</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="io-policy"
              value="zero-persistence"
              checked={ioPolicy === "zero-persistence"}
              onChange={() => setIoPolicy("zero-persistence")}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700">Never retain input/output data (zero-persistence)</span>
          </label>
        </div>
      </Card>

      {/* I/O Data Retention Period */}
      {ioPolicy === "retain" && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Input/Output Data Retention Period</h3>
          <p className="text-xs text-gray-500 mb-4">
            Select how long input/output data is stored. Once input/output data is removed for a
            given run, you will no longer be able to retry that run.
          </p>

          <select
            defaultValue={data.ioRetentionPeriod}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {retentionOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <SaveButton />
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

      <Card>
        <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <Download size={24} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">No exports yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Export your work order history to download it as a file.
          </p>
          <button className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            Create Export
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle switch component                                            */
/* ------------------------------------------------------------------ */

function ToggleSwitch({ checked }: { checked: boolean }) {
  const [on, setOn] = useState(checked);
  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
        on ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          on ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
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
    <div>
      <Breadcrumbs
        ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))}
        current={node.label}
      />

      <div className="mt-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{projectLabel} Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage settings and configuration for this project.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar tabs */}
        <nav className="w-48 flex-shrink-0">
          <div className="space-y-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-blue-500" : "text-gray-400"} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {activeTab === "setup" && <SetupSection data={data} />}
          {activeTab === "credentials" && <CredentialsSection data={data} />}
          {activeTab === "webhook-security" && <WebhookSecuritySection />}
          {activeTab === "collaboration" && <CollaborationSection data={data} />}
          {activeTab === "security" && <SecuritySection data={data} />}
          {activeTab === "sync-to-github" && <SyncToGithubSection data={data} />}
          {activeTab === "data-storage" && <DataStorageSection data={data} />}
          {activeTab === "history-exports" && <HistoryExportsSection />}
        </div>
      </div>
    </div>
  );
}
