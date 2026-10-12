import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Minus,
  Plus,
  Equal,
  GitCompare,
} from "lucide-react";
import SidebarSection from "../components/SidebarSection";

/* ------------------------------------------------------------------ */
/*  Old (Lightning) IA tree – derived from the current app hierarchy  */
/* ------------------------------------------------------------------ */

interface TreeNode {
  label: string;
  path?: string;
  note?: string;
  children?: TreeNode[];
}

const lightningTree: TreeNode[] = [
  {
    label: "Projects",
    path: "/projects",
    note: "DashboardLive.Index — Main dashboard with projects table",
    children: [
      {
        label: "Project Scope",
        path: "/projects/:project_id",
        children: [
          {
            label: "Workflows",
            path: "/projects/:project_id/w",
            note: "WorkflowLive.Index — Workflow list with metrics cards",
            children: [
              {
                label: "New Workflow",
                path: "/projects/:project_id/w/new",
                note: "WorkflowLive.Collaborate — Collaborative editor",
              },
              {
                label: "Edit Workflow",
                path: "/projects/:project_id/w/:id",
                note: "WorkflowLive.Collaborate — DAG canvas, job inspector, triggers, edges, AI chat",
              },
            ],
          },
          {
            label: "History",
            path: "/projects/:project_id/history",
            note: "RunLive.Index — Work orders & channel logs with filters, bulk actions",
            children: [
              {
                label: "Run Detail",
                path: "/projects/:project_id/runs/:id",
                note: "RunLive.Show — Steps list, log/input/output tabs",
              },
            ],
          },
          {
            label: "Dataclip Detail",
            path: "/projects/:project_id/dataclips/:id/show",
            note: "DataclipLive.Show — JSON viewer with retention policy",
          },
          {
            label: "Channels",
            path: "/projects/:project_id/channels",
            note: "ChannelLive.Index — Metrics, channels table, CRUD",
          },
          {
            label: "Sandboxes",
            path: "/projects/:project_id/sandboxes",
            note: "SandboxLive.Index — Hierarchical workspace list, merge/delete",
          },
          {
            label: "Project Settings",
            path: "/projects/:project_id/settings",
            note: "ProjectLive.Settings — 9-tab interface",
            children: [
              { label: "Setup", note: "Name, environment, export YAML, delete" },
              { label: "Credentials", note: "New credential, OAuth clients, keychain" },
              { label: "Collections", note: "Project collections" },
              { label: "Webhook Security", note: "Auth methods table" },
              { label: "Collaboration", note: "Collaborators, support access" },
              { label: "Security", note: "MFA enforcement" },
              { label: "Sync to GitHub", note: "GitHub integration" },
              { label: "Data Storage", note: "Retention policy" },
              { label: "History Exports", note: "Manage exports" },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "User Profile & Credentials",
    children: [
      {
        label: "Profile",
        path: "/profile",
        note: "ProfileLive.Edit — User info, email, password, MFA, GitHub",
      },
      {
        label: "Personal Access Tokens",
        path: "/profile/tokens",
        note: "TokensLive.Index — Token management",
      },
      {
        label: "MFA Backup Codes",
        path: "/profile/auth/backup_codes",
        note: "BackupCodesLive.Index — Backup codes grid",
      },
      {
        label: "Credentials",
        path: "/credentials",
        note: "CredentialLive.Index — Global credentials & OAuth clients",
      },
    ],
  },
  {
    label: "2FA Flow",
    children: [
      {
        label: "TOTP Verification",
        path: "/users/two-factor",
        note: "UserTOTPController — TOTP or backup code input",
      },
    ],
  },
  {
    label: "Admin Settings (Superuser)",
    path: "/settings",
    note: "SettingsLive.Index — Admin dashboard hub",
    children: [
      {
        label: "User Management",
        path: "/settings/users",
        note: "UserLive.Index — Users table, create/edit/delete",
      },
      {
        label: "Project Administration",
        path: "/settings/projects",
        note: "ProjectLive.Index — Projects table, admin controls",
      },
      {
        label: "Audit Log",
        path: "/settings/audit",
        note: "AuditLive.Index — Expandable rows with field diffs",
      },
      {
        label: "Authentication Providers",
        path: "/settings/authentication",
        note: "AuthProvidersLive.Index — OAuth/OIDC config",
      },
      {
        label: "Collections",
        path: "/settings/collections",
        note: "CollectionLive.Index — Collections CRUD",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  New (Proposed) IA tree – mirrors ia-tree.ts                       */
/* ------------------------------------------------------------------ */

const proposedTree: TreeNode[] = [
  {
    label: "Overview",
    path: "/overview",
    note: "Dashboard — What needs attention, recent activity, links into Status & Insights",
  },
  {
    label: "Handbook",
    path: "/handbook",
    note: "How the org works, with the files that go with it",
  },
  {
    label: "Systems",
    path: "/connected-systems",
    note: "List — Browse & manage all connected external systems",
    children: [
      {
        label: ":system",
        path: "/connected-systems/:system",
        note: "Detail — System metadata, credentials, channels",
        children: [
          { label: "Channels", note: "Channels for this system" },
        ],
      },
      {
        label: "Credentials",
        path: "/connected-systems/credentials",
        note: "Org & user credentials management",
        children: [
          { label: "Org Credentials", note: "Organization-wide shared credentials" },
          { label: "User Credentials", note: "Per-user scoped credentials" },
        ],
      },
    ],
  },
  {
    label: "Services",
    path: "/service-catalog",
    note: "Services — Published services from all projects & systems",
    children: [
      { label: "Live Services", note: "All live services from projects" },
      { label: "Channels", note: "Channels exposed by connected systems" },
    ],
  },
  {
    label: "Status",
    path: "/status",
    note: "What's up, degraded, or failing right now",
  },
  {
    label: "Insights",
    path: "/insights",
    note: "Runs, errors & throughput over time",
  },
  {
    label: "History",
    path: "/history",
    note: "Table — Cross-project work orders & channel requests",
  },
  {
    label: "Projects",
    path: "/projects",
    note: "Projects — Every project; the four most recent are pinned in the sidebar",
    children: [
      {
        label: ":project",
        path: "/projects/:project",
        note: "Project — Overview with published services & components; top bar shows project and sandbox pickers, sidebar swaps in the project menu (Overview; Build; Maintain)",
        children: [
          { label: "Create", note: "Build: \"What would you like to build?\" AI prompt, with starter ideas and every system, channel & service to draw on" },
          { label: "Workflows", note: "Build: every workflow in this project" },
          {
            label: "Components",
            note: "Build: channels, forms, artifacts & collections, grouped by type",
            children: [{ label: ":component", note: "Individual component" }],
          },
          { label: "Sandboxes", note: "Build: isolated copies for trying out changes" },
          { label: "History", note: "Maintain: work orders & channel requests for this project" },
          { label: "Insights", note: "Maintain: runs, errors & run times for this project" },
          { label: "Deployments", note: "Maintain: what's running in production and where it came from" },
          { label: "Settings", note: "Maintain: 8-tab project settings" },
          {
            label: "Services",
            note: "Published services from this project (linked from Overview)",
            children: [{ label: ":service", note: "Individual service (links to builder)" }],
          },
        ],
      },
    ],
  },
  {
    label: "Workflow Editor",
    path: "/workflow-editor/:workflow",
    note: "Full-screen editor, outside the sidebar layout",
  },
  {
    label: "Get Help Now",
    path: "/get-help",
    note: "Pinned to the bottom of the sidebar on every page",
  },
  {
    label: "OpenFn Docs",
    path: "docs.openfn.org",
    note: "External link to the OpenFn documentation",
  },
  {
    label: "Service Builder",
    path: "/service-builder",
    note: "Design & configure services",
    children: [
      {
        label: "Spec",
        note: "Service specification",
        children: [
          { label: "Input", note: "Input schema & sources" },
          { label: "Workflow / Modules", note: "Processing steps" },
          { label: "Output", note: "Output format & destinations" },
        ],
      },
    ],
  },
  {
    label: "User Settings",
    path: "/user-settings",
    note: "Personal account settings",
    children: [
      { label: "Profile", note: "Name, email, password, MFA, GitHub, delete account" },
      { label: "Credentials", note: "Personal credentials & OAuth clients" },
      { label: "API Tokens", note: "Personal access tokens" },
    ],
  },
  {
    label: "Instance Settings",
    path: "/instance-settings",
    note: "Instance-level settings",
    children: [
      { label: "Collaboration", note: "Members & roles" },
      { label: "Billing", note: "Billing, usage, subscriptions" },
      { label: "Context", note: "Connected context layers; request access to more" },
    ],
  },
];

/**
 * How the proposed tree is grouped, matching the sidebar's section headings
 * (see mainNavGroups in ia-tree.ts). Items are top-level node labels.
 */
const proposedGroups: { label?: string; items: string[] }[] = [
  { items: ["Overview"] },
  { label: "Context", items: ["Handbook", "Systems", "Services"] },
  { label: "Monitoring", items: ["Status", "Insights", "History"] },
  { label: "Projects", items: ["Projects", "Workflow Editor", "Service Builder"] },
  { label: "Support", items: ["Get Help Now", "OpenFn Docs"] },
  { label: "Account menu", items: ["User Settings", "Instance Settings"] },
];

/* ------------------------------------------------------------------ */
/*  Mapping: which old pages map to which new pages                   */
/* ------------------------------------------------------------------ */

interface MappingEntry {
  oldPath: string;
  newPath: string;
  status: "moved" | "merged" | "split" | "renamed" | "same" | "removed" | "new";
  note?: string;
}

const mappings: MappingEntry[] = [
  { oldPath: "—", newPath: "/overview", status: "new", note: "Instance-level home: what needs attention and recent activity" },
  { oldPath: "/projects", newPath: "/projects", status: "same", note: "Projects list stays; recent projects are also pinned in the sidebar" },
  { oldPath: "/projects/:id/w", newPath: "/projects/:id/workflows", status: "renamed", note: "Same page, readable URL" },
  { oldPath: "/projects/:id/w/:wid", newPath: "/workflow-editor/:wid", status: "moved", note: "Editor goes full-screen, outside the sidebar layout" },
  { oldPath: "/projects/:id/history", newPath: "/projects/:id/history", status: "same", note: "Still per project; /history adds the cross-project view" },
  { oldPath: "/projects/:id/channels", newPath: "/projects/:id/components", status: "merged", note: "Channels are now one group on the project's Components page" },
  { oldPath: "/projects/:id/sandboxes", newPath: "/projects/:id/sandboxes", status: "same", note: "Still per project" },
  { oldPath: "/projects/:id/settings", newPath: "/projects/:id/settings", status: "same", note: "Still per project; Collections tab moves to project Components" },
  { oldPath: "/credentials", newPath: "/connected-systems/credentials + /user-settings/credentials", status: "split", note: "Org credentials grouped under Systems; personal credentials & OAuth clients in User Settings" },
  { oldPath: "/profile", newPath: "/user-settings/profile", status: "moved", note: "Profile nested under User Settings" },
  { oldPath: "/profile/tokens", newPath: "/user-settings/api-tokens", status: "moved", note: "API tokens are a User Settings section" },
  { oldPath: "/settings/users", newPath: "/instance-settings/collaboration", status: "renamed", note: "Admin users → Collaboration" },
  { oldPath: "/settings/audit", newPath: "—", status: "removed", note: "Not in proposed IA (may be added later)" },
  { oldPath: "/settings/authentication", newPath: "—", status: "removed", note: "Not in proposed IA (may be added later)" },
  { oldPath: "—", newPath: "/handbook", status: "new", note: "How the org works, with the files that go with it" },
  { oldPath: "—", newPath: "/connected-systems", status: "new", note: "Systems: new top-level concept for external integrations" },
  { oldPath: "—", newPath: "/service-catalog", status: "new", note: "Services: published services and channels across the org" },
  { oldPath: "—", newPath: "/status", status: "new", note: "What's up, degraded, or failing right now" },
  { oldPath: "—", newPath: "/insights", status: "new", note: "Runs, errors & throughput over time" },
  { oldPath: "—", newPath: "/history", status: "new", note: "Cross-project work orders & channel requests" },
  { oldPath: "—", newPath: "/projects/:id/services/:sid", status: "new", note: "A published service's catalog entry (API docs), linked from the project Overview and Services" },
  { oldPath: "—", newPath: "/projects/:id/create", status: "new", note: "AI prompt for new public service ideas, showcasing available systems, channels & services" },
  { oldPath: "—", newPath: "/projects/:id/insights", status: "new", note: "Per-project runs, errors & run times" },
  { oldPath: "—", newPath: "/projects/:id/deployments", status: "new", note: "What's deployed, when, and from which sandbox" },
  { oldPath: "—", newPath: "/service-builder", status: "new", note: "New dedicated service design tool" },
  { oldPath: "—", newPath: "/get-help", status: "new", note: "Support, pinned to the bottom of the sidebar" },
];

/* ------------------------------------------------------------------ */
/*  Components                                                        */
/* ------------------------------------------------------------------ */

function TreeNodeRow({
  node,
  depth = 0,
  side,
}: {
  node: TreeNode;
  depth?: number;
  side: "old" | "new";
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-start gap-1.5 py-1 cursor-pointer hover:bg-gray-50 rounded px-1 group"
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <button className="mt-0.5 p-0.5 flex-shrink-0 text-gray-400 group-hover:text-gray-600">
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {node.label}
            </span>
            {node.path && (
              <code className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${
                side === "old"
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}>
                {node.path}
              </code>
            )}
          </div>
          {node.note && (
            <p className="text-xs text-gray-500 mt-0.5">{node.note}</p>
          )}
        </div>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child, i) => (
            <TreeNodeRow key={child.label + i} node={child} depth={depth + 1} side={side} />
          ))}
        </div>
      )}
    </div>
  );
}

const statusColors: Record<MappingEntry["status"], string> = {
  moved: "bg-blue-100 text-blue-700",
  merged: "bg-purple-100 text-purple-700",
  split: "bg-orange-100 text-orange-700",
  renamed: "bg-yellow-100 text-yellow-700",
  same: "bg-gray-100 text-gray-600",
  removed: "bg-red-100 text-red-700",
  new: "bg-green-100 text-green-700",
};

const statusIcons: Record<MappingEntry["status"], typeof ArrowRight> = {
  moved: ArrowRight,
  merged: ArrowRight,
  split: ArrowRight,
  renamed: ArrowRight,
  same: Equal,
  removed: Minus,
  new: Plus,
};

type ViewMode = "side-by-side" | "mapping";

export default function IAComparisonPage() {
  const [view, setView] = useState<ViewMode>("side-by-side");

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare size={20} className="text-indigo-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              IA Comparison
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Side-by-side comparison of the current Lightning page hierarchy vs.
            the proposed new information architecture.
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          <button
            className={`px-3 py-1.5 ${
              view === "side-by-side"
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setView("side-by-side")}
          >
            Side by Side
          </button>
          <button
            className={`px-3 py-1.5 border-l border-gray-200 ${
              view === "mapping"
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setView("mapping")}
          >
            Route Mapping
          </button>
        </div>
      </div>

      {view === "side-by-side" ? (
        /* ----- Side-by-Side Trees ----- */
        <div className="grid grid-cols-2 gap-6">
          {/* Old */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 px-4 py-2.5">
              <h2 className="text-sm font-semibold text-red-800">
                Current (Lightning)
              </h2>
              <p className="text-xs text-red-600 mt-0.5">
                Phoenix LiveView — project-scoped, flat navigation
              </p>
            </div>
            <div className="p-3 max-h-[calc(100vh-280px)] overflow-y-auto">
              {lightningTree.map((node, i) => (
                <TreeNodeRow key={node.label + i} node={node} side="old" />
              ))}
            </div>
          </div>

          {/* New */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-green-50 border-b border-green-100 px-4 py-2.5">
              <h2 className="text-sm font-semibold text-green-800">
                Proposed (New IA)
              </h2>
              <p className="text-xs text-green-600 mt-0.5">
                React SPA — top-level concepts, instance-wide views
              </p>
            </div>
            <div className="p-3 max-h-[calc(100vh-280px)] overflow-y-auto">
              <div className="space-y-4">
                {proposedGroups.map((group) => (
                  <SidebarSection key={group.label ?? "top"} label={group.label}>
                    {group.items.map((label) => {
                      const node = proposedTree.find((n) => n.label === label);
                      return node ? <TreeNodeRow key={label} node={node} side="new" /> : null;
                    })}
                  </SidebarSection>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ----- Route Mapping Table ----- */
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5">
            <h2 className="text-sm font-semibold text-gray-700">
              Route Mapping
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              How pages from the current app map to the proposed IA
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Current Route
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-8">
                    {" "}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Proposed Route
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {mappings.map((m, i) => {
                  const Icon = statusIcons[m.status];
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[m.status]}`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <code className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-mono">
                          {m.oldPath}
                        </code>
                      </td>
                      <td className="px-4 py-2 text-center text-gray-400">
                        <Icon size={14} />
                      </td>
                      <td className="px-4 py-2">
                        <code className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-mono">
                          {m.newPath}
                        </code>
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-500">
                        {m.note}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="font-medium text-gray-700">Legend:</span>
        {Object.entries(statusColors).map(([status, cls]) => (
          <span key={status} className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${cls}`}>
            {status}
          </span>
        ))}
      </div>
    </div>
  );
}
