import { useState } from "react";
import { CreditCard, Eye, Layers, Network, Plus, Save, Unplug, UserPlus, Users } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type {
  BillingDetails,
  ContextLayer,
  OrganizationMember,
  OrganizationSettingsPageData,
  VisibilityScope,
} from "../model/page-data";
import type { OrgXRoadSettings, SecurityServer, SecurityServerManager, XRoadCertificate, XRoadSubsystem } from "../model/xroad";
import { memberClassLabels, securityServerManagerLabels } from "../model/xroad";
import { clientIdOf } from "../model/xroad";
import SettingsLayout from "../components/patterns/SettingsLayout";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import type { SettingsNavItem } from "../components/patterns/SettingsNav";
import SectionHeading from "../components/primitives/SectionHeading";
import Card from "../components/primitives/Card";
import Button from "../components/primitives/Button";
import Badge from "../components/primitives/Badge";
import Callout from "../components/primitives/Callout";
import CopyValue from "../components/primitives/CopyValue";
import DataTable from "../components/primitives/DataTable";
import type { DataTableColumn } from "../components/primitives/DataTable";
import EmptyState from "../components/primitives/EmptyState";
import FormField from "../components/primitives/FormField";
import PropertyList from "../components/primitives/PropertyList";
import StatTile from "../components/primitives/StatTile";
import { RadioOption, TextInput } from "../components/primitives/FormControls";

const BASE_PATH = "/organization-settings";

const navItems: SettingsNavItem[] = [
  { id: "members", label: "Members", icon: Users, to: `${BASE_PATH}/members` },
  { id: "visibility", label: "Visibility", icon: Eye, to: `${BASE_PATH}/visibility` },
  { id: "context", label: "Context", icon: Layers, to: `${BASE_PATH}/context` },
  { id: "xroad", label: "X-Road", icon: Network, to: `${BASE_PATH}/xroad` },
  { id: "billing", label: "Billing", icon: CreditCard, to: `${BASE_PATH}/billing` },
];

/* ------------------------------------------------------------------ */
/*  Members                                                            */
/* ------------------------------------------------------------------ */

const roleTones = { Owner: "indigo", Admin: "green", Member: "gray" } as const;

function MembersSection({ members, name }: { members: OrganizationMember[]; name: string }) {
  const columns: DataTableColumn<OrganizationMember>[] = [
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
      {visibilityKinds.filter((kind) => initial[kind.id]).map((kind) => (
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
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface ContextActions {
  /** Asks for access to a source of context, by its URL; it waits for approval. */
  onRequestContextAccess: (url: string) => Promise<void>;
  /** Disconnects a source of context, or cancels a request for one. */
  onRemoveContextLayer: (id: string) => Promise<void>;
}

function ContextSection({
  layers,
  onRequestContextAccess,
  onRemoveContextLayer,
}: { layers: ContextLayer[] } & ContextActions) {
  const [url, setUrl] = useState("");

  const requestAccess = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    await onRequestContextAccess(trimmed);
    setUrl("");
  };

  const columns: DataTableColumn<ContextLayer>[] = [
    {
      key: "name",
      header: "Context layer",
      render: (l) => (
        <div>
          <p className="font-medium text-gray-900">{l.name}</p>
          <p className="text-xs text-gray-400">{l.host}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (l) =>
        l.status === "connected" ? (
          <Badge label="Connected" tone="green" />
        ) : (
          <Badge label="Awaiting approval" tone="yellow" />
        ),
    },
    {
      key: "last-fetched",
      header: "Last fetched",
      render: (l) => l.lastFetched ?? "Not yet fetched",
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (l) => (
        <Button variant="secondary" size="xs" icon={Unplug} onClick={() => void onRemoveContextLayer(l.id)}>
          {l.status === "connected" ? "Disconnect" : "Cancel request"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <SectionHeading
          title="Context layers"
          description="Shared sources of handbook pages, systems and services that your organisation draws on."
        />
        {layers.length > 0 ? (
          <DataTable columns={columns} rows={layers} getRowKey={(l) => l.id} />
        ) : (
          <EmptyState
            icon={Layers}
            title="No context layers connected"
            description="Add one below to start drawing on shared context."
          />
        )}
      </div>

      <Card
        title="Add a context layer"
        description="Paste the URL of another context layer. Its owners will need to approve the request before it's loaded here."
      >
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            requestAccess();
          }}
        >
          <div className="flex-1">
            <FormField label="Context layer URL" htmlFor="context-layer-url">
              <TextInput
                id="context-layer-url"
                type="url"
                placeholder="https://example.org/context/my-layer"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </FormField>
          </div>
          <Button type="submit" icon={Plus} disabled={!url.trim()}>
            Request access
          </Button>
        </form>
      </Card>
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

function XRoadSection({ xroad, xroadUsage }: { xroad: OrgXRoadSettings; xroadUsage: OrganizationSettingsPageData["xroadUsage"] }) {
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
/*  Billing                                                            */
/* ------------------------------------------------------------------ */

function BillingSection({ billing }: { billing: BillingDetails }) {
  const usedPercent = Math.round((billing.runsUsed / billing.runsIncluded) * 100);
  const columns: DataTableColumn<BillingDetails["invoices"][number]>[] = [
    { key: "date", header: "Date", render: (i) => i.date },
    { key: "amount", header: "Amount", render: (i) => <span className="text-gray-900">{i.amount}</span> },
    {
      key: "status",
      header: "Status",
      render: (i) => <Badge label={i.status} tone={i.status === "Paid" ? "green" : "yellow"} />,
    },
  ];

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Billing"
        description="Your plan, how much of it you've used this cycle, and past invoices."
        action={
          <Button variant="secondary" size="sm">
            Change plan
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Plan" value={billing.plan} detail={billing.price} />
        <StatTile
          label="Runs this cycle"
          value={billing.runsUsed.toLocaleString()}
          detail={`${usedPercent}% of ${billing.runsIncluded.toLocaleString()} included`}
        />
        <StatTile label="Renews on" value={billing.renewsOn} />
      </div>

      <div>
        <SectionHeading title="Invoices" />
        <DataTable columns={columns} rows={billing.invoices} getRowKey={(i) => i.id} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main template                                                      */
/* ------------------------------------------------------------------ */

export interface OrganizationSettingsPageProps extends PageProps<OrganizationSettingsPageData>, ContextActions {}

/**
 * The organisation's settings, from the account menu: everything it sets
 * once. Its members, what others can see by default, the context layers it
 * draws on, its identity on X-Road (which connected systems and published
 * services reuse), and billing.
 */
export default function OrganizationSettingsPage({
  node,
  ancestors,
  data,
  onRequestContextAccess,
  onRemoveContextLayer,
}: OrganizationSettingsPageProps) {
  // Without X-Road there's no X-Road section. The /organization-settings root shows the first section.
  const items = navItems.filter((item) => item.id !== "xroad" || data.xroad);
  const activeId = items.some((item) => item.id === node.id) ? node.id : items[0].id;
  return (
    <SettingsLayout
      breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
      title="Organization settings"
      description={`Who's in the ${data.name}, what others can see, the context you draw on, ${data.xroad ? "your identity on X-Road, " : ""}and billing.`}
      navItems={items}
      activeId={activeId}
    >
      {activeId === "members" && <MembersSection members={data.members} name={data.name} />}
      {activeId === "visibility" && <VisibilitySection initial={data.visibility} />}
      {activeId === "context" && (
        <ContextSection
          layers={data.contextLayers}
          onRequestContextAccess={onRequestContextAccess}
          onRemoveContextLayer={onRemoveContextLayer}
        />
      )}
      {activeId === "xroad" && data.xroad && <XRoadSection xroad={data.xroad} xroadUsage={data.xroadUsage} />}
      {activeId === "billing" && <BillingSection billing={data.billing} />}
    </SettingsLayout>
  );
}
