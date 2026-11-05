import { useState } from "react";
import { Eye, Network, Save, UserPlus, Users } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { InstanceMember, OrganizationSettingsPageData, VisibilityScope } from "../model/page-data";
import type { SecurityServer, SecurityServerManager, XRoadCertificate, XRoadSubsystem } from "../model/xroad";
import { memberClassLabels, securityServerManagerLabels } from "../model/xroad";
import { clientIdOf } from "../model/xroad";
import SettingsLayout from "../components/patterns/SettingsLayout";
import type { SettingsNavItem } from "../components/patterns/SettingsNav";
import SectionHeading from "../components/primitives/SectionHeading";
import Card from "../components/primitives/Card";
import Button from "../components/primitives/Button";
import Badge from "../components/primitives/Badge";
import Callout from "../components/primitives/Callout";
import CopyValue from "../components/primitives/CopyValue";
import DataTable from "../components/primitives/DataTable";
import type { DataTableColumn } from "../components/primitives/DataTable";
import PropertyList from "../components/primitives/PropertyList";
import { RadioOption } from "../components/primitives/FormControls";

const BASE_PATH = "/organization-settings";

const navItems: SettingsNavItem[] = [
  { id: "members", label: "Members", icon: Users, to: `${BASE_PATH}/members` },
  { id: "visibility", label: "Visibility", icon: Eye, to: `${BASE_PATH}/visibility` },
  { id: "xroad", label: "X-Road", icon: Network, to: `${BASE_PATH}/xroad` },
];

/* ------------------------------------------------------------------ */
/*  Members                                                            */
/* ------------------------------------------------------------------ */

const roleTones = { Owner: "indigo", Admin: "green", Member: "gray" } as const;

function MembersSection({ members, name }: { members: InstanceMember[]; name: string }) {
  const columns: DataTableColumn<InstanceMember>[] = [
    {
      key: "name",
      header: "Name",
      render: (m) => (
        <div>
          <p className="font-medium text-gray-900">{m.name}</p>
          <p className="text-xs text-gray-400">{m.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (m) => <Badge label={m.role} tone={roleTones[m.role]} /> },
    { key: "last-active", header: "Last active", render: (m) => m.lastActive },
  ];
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Members"
        description={`Everyone in the ${name}, and what they're allowed to do.`}
        action={
          <Button size="sm" icon={UserPlus}>
            Invite member
          </Button>
        }
      />
      <DataTable columns={columns} rows={members} getRowKey={(m) => m.id} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Visibility                                                         */
/* ------------------------------------------------------------------ */

const scopes: { id: VisibilityScope; label: string; hint: (thing: string) => string }[] = [
  { id: "project", label: "Project members", hint: (t) => `Only people in the project can find and use its ${t}.` },
  { id: "organization", label: "Organisation", hint: (t) => `Anyone in the organisation can find and ask to use ${t}.` },
  { id: "server", label: "Whole server", hint: (t) => `Every organisation on this OpenFn server can find ${t}.` },
];

const visibilityKinds = [
  { id: "projects", title: "Projects", thing: "workflows and components", description: "Who can see a new project and what's in it." },
  { id: "systems", title: "Connected systems", thing: "systems", description: "Who can see a system and ask for access to it." },
  { id: "services", title: "Services", thing: "services", description: "Who can find a published service in the catalogue and call it." },
] as const;

function VisibilitySection({ initial }: { initial: OrganizationSettingsPageData["visibility"] }) {
  const [visibility, setVisibility] = useState(initial);
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Visibility"
        description="The defaults for anything new. Each project, system and service can still change its own."
        action={
          <Button size="sm" icon={Save}>
            Save
          </Button>
        }
      />
      {visibilityKinds.map((kind) => (
        <Card key={kind.id} title={kind.title} description={kind.description}>
          <div className="space-y-3" role="radiogroup" aria-label={`${kind.title} visible to`}>
            {scopes.map((scope) => (
              <RadioOption
                key={scope.id}
                name={`visibility-${kind.id}`}
                label={scope.label}
                hint={scope.hint(kind.thing)}
                checked={visibility[kind.id] === scope.id}
                onChange={() => setVisibility({ ...visibility, [kind.id]: scope.id })}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  X-Road                                                             */
/* ------------------------------------------------------------------ */

const subsystemColumns: DataTableColumn<XRoadSubsystem>[] = [
  { key: "code", header: "Subsystem", render: (s) => <code className="font-mono text-sm text-gray-900">{s.code}</code> },
  { key: "description", header: "Used for", render: (s) => <span className="text-sm text-gray-600">{s.description}</span> },
  {
    key: "openfn",
    header: "",
    align: "right",
    render: (s) => (s.openfn ? <Badge label="OpenFn" tone="indigo" /> : null),
  },
];

const serverColumns: DataTableColumn<SecurityServer>[] = [
  {
    key: "code",
    header: "Security Server",
    render: (s) => (
      <div>
        <p className="font-medium text-gray-900">{s.code}</p>
        <p className="font-mono text-xs text-gray-400">{s.address}</p>
      </div>
    ),
  },
  { key: "version", header: "Version", render: (s) => s.version },
  { key: "last-seen", header: "Last seen", render: (s) => s.lastSeen },
  {
    key: "status",
    header: "Status",
    align: "right",
    render: (s) => (s.enabled ? <Badge label="Enabled" tone="green" /> : <Badge label="Disabled" />),
  },
];

const certificateColumns: DataTableColumn<XRoadCertificate>[] = [
  { key: "kind", header: "Certificate", render: (c) => <span className="font-medium text-gray-900">{c.kind}</span> },
  {
    key: "subject",
    header: "Subject",
    render: (c) => (
      <div>
        <p className="font-mono text-xs text-gray-700">{c.subject}</p>
        <p className="text-xs text-gray-400">Issued by {c.issuer}</p>
      </div>
    ),
  },
  {
    key: "expires",
    header: "Expires",
    align: "right",
    render: (c) => (
      <span className="inline-flex items-center gap-2">
        {c.expires}
        {c.status === "expiring" && <Badge label="Renew soon" tone="yellow" />}
      </span>
    ),
  },
];

function XRoadSection({ data }: { data: OrganizationSettingsPageData }) {
  const { xroad, xroadUsage } = data;
  const [managedBy, setManagedBy] = useState<SecurityServerManager>(xroad.managedBy);
  return (
    <div className="space-y-8">
      <SectionHeading
        title="X-Road"
        description="Who your organisation is on X-Road. OpenFn is a subsystem under your organisation, never a member of its own."
        action={
          <Button size="sm" icon={Save}>
            Save
          </Button>
        }
      />

      <Callout title="Set once, used everywhere">
        {xroadUsage.systems} connected systems and {xroadUsage.services} published service
        {xroadUsage.services === 1 ? "" : "s"} use these settings, so nobody has to enter routing details or headers
        again when they connect a system or publish a workflow.
      </Callout>

      <section>
        <SectionHeading title="Identity" variant="label" />
        <PropertyList
          properties={[
            { label: "Instance", value: <code className="font-mono">{xroad.instance}</code> },
            {
              label: "Member class",
              value: (
                <span>
                  <code className="font-mono">{xroad.memberClass}</code>
                  <span className="ml-2 text-gray-500">{memberClassLabels[xroad.memberClass]}</span>
                </span>
              ),
            },
            { label: "Member code", value: <code className="font-mono">{xroad.memberCode}</code> },
            { label: "Member name", value: xroad.memberName },
            {
              label: "OpenFn calls as",
              value: (
                <div className="w-80 max-w-full">
                  <CopyValue value={clientIdOf(xroad)} label="Copy client ID" />
                </div>
              ),
            },
          ]}
        />
      </section>

      <section>
        <SectionHeading title="Subsystems" variant="label" />
        <DataTable columns={subsystemColumns} rows={xroad.subsystems} getRowKey={(s) => s.code} />
      </section>

      <section className="space-y-4">
        <SectionHeading title="Security Servers" variant="label" />
        <DataTable columns={serverColumns} rows={xroad.securityServers} getRowKey={(s) => s.id} />
        <Card title="Security Server managed by" description="Who to go to when something needs changing on it, such as access rights.">
          <div className="space-y-3" role="radiogroup" aria-label="Security Server managed by">
            {(Object.keys(securityServerManagerLabels) as SecurityServerManager[]).map((id) => (
              <RadioOption
                key={id}
                name="security-server-manager"
                label={securityServerManagerLabels[id].label}
                hint={securityServerManagerLabels[id].hint}
                checked={managedBy === id}
                onChange={() => setManagedBy(id)}
              />
            ))}
          </div>
        </Card>
      </section>

      <section>
        <SectionHeading title="Certificates" variant="label" />
        <DataTable columns={certificateColumns} rows={xroad.certificates} getRowKey={(c) => c.id} />
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main template                                                      */
/* ------------------------------------------------------------------ */

export type OrganizationSettingsPageProps = PageProps<OrganizationSettingsPageData>;

/**
 * The organisation's settings, from the account menu: its members, what
 * others can see by default, and its identity on X-Road, which connected
 * systems and published services reuse.
 */
export default function OrganizationSettingsPage({ node, ancestors, data }: OrganizationSettingsPageProps) {
  const activeId = navItems.some((item) => item.id === node.id) ? node.id : navItems[0].id;
  return (
    <SettingsLayout
      breadcrumbs={{
        ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
        current: node.label,
      }}
      title="Organization settings"
      description={`Who's in the ${data.name}, what others can see by default, and your identity on X-Road.`}
      navItems={navItems}
      activeId={activeId}
    >
      {activeId === "members" && <MembersSection members={data.members} name={data.name} />}
      {activeId === "visibility" && <VisibilitySection initial={data.visibility} />}
      {activeId === "xroad" && <XRoadSection data={data} />}
    </SettingsLayout>
  );
}
