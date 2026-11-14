import { useState } from "react";
import { Building2, CreditCard, Eye, Network, Save, Trash2, UserPlus, Users } from "lucide-react";
import type { PageProps } from "../../model/ia-tree";
import type { OrganizationSettings } from "../../model/organization";
import { type BillingDetails, type OrganizationInvite, type OrganizationMember, type VisibilityScope, logoProblem, LOGO_ACCEPT, organizationRoles } from "../../model/organization";
import { instanceInitials } from "../../model/account";
import { errorMessageOf, fieldErrorOf } from "../../model/form-error";
import { type OrgXRoadSettings, type SecurityServer, type SecurityServerManager, type XRoadCertificate, type XRoadSubsystem, memberClassLabels, securityServerManagerLabels, clientIdOf } from "../../model/xroad";
import SettingsLayout from "../../components/patterns/SettingsLayout";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import type { SettingsNavItem } from "../../components/primitives/SettingsNav";
import SectionHeading from "../../components/primitives/SectionHeading";
import Card from "../../components/primitives/Card";
import Button from "../../components/primitives/Button";
import { focusFirstProblem } from "../../components/primitives/focus-field";
import Badge from "../../components/primitives/Badge";
import Callout from "../../components/primitives/Callout";
import CopyValue from "../../components/primitives/CopyValue";
import DataTable from "../../components/primitives/DataTable";
import type { DataTableColumn } from "../../components/primitives/DataTable";
import FormField from "../../components/primitives/FormField";
import PropertyList from "../../components/primitives/PropertyList";
import StatTile from "../../components/primitives/StatTile";
import { RadioOption, TextInput } from "../../components/primitives/FormControls";
import ActionMenu from "../../components/primitives/ActionMenu";
import FileDropzone from "../../components/primitives/FileDropzone";
import IconTile from "../../components/primitives/IconTile";
import Text from "../../components/primitives/Text";
import ConfirmModal from "../../components/primitives/ConfirmModal";
import InviteOrgMemberModal from "../../components/domain/InviteOrgMemberModal";
import Inline from "../../components/primitives/Inline";
import Stack from "../../components/primitives/Stack";

const BASE_PATH = "/organization-settings";

const navItems: SettingsNavItem[] = [
  { id: "general", label: "General", icon: Building2, to: `${BASE_PATH}/general` },
  { id: "members", label: "Members", icon: Users, to: `${BASE_PATH}/members` },
  { id: "visibility", label: "Visibility", icon: Eye, to: `${BASE_PATH}/visibility` },
  { id: "xroad", label: "X-Road", icon: Network, to: `${BASE_PATH}/xroad` },
  { id: "billing", label: "Billing", icon: CreditCard, to: `${BASE_PATH}/billing` },
];

/* ------------------------------------------------------------------ */
/*  General                                                            */
/* ------------------------------------------------------------------ */

interface LogoActions {
  /** Sets the organisation's logo from an image, as a data URL. Rejects with what the server refused, said under the field. Left out when you can't change the organisation. */
  onSaveLogo?: (logo: string) => Promise<void>;
  /** Takes the logo off, so the organisation's initials show in its place. Left out when you can't change the organisation. */
  onRemoveLogo?: () => Promise<void>;
}

/** Reads a picked file as a data URL, the way the logo is sent. */
const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

function LogoCard({ name, logo, onSaveLogo, onRemoveLogo }: { name: string; logo?: string } & LogoActions) {
  const [problem, setProblem] = useState<string>();
  const [busy, setBusy] = useState<"uploading" | "removing">();
  const upload = async (file: File | undefined) => {
    if (!file || !onSaveLogo || busy) return;
    // Said under the field before it's sent; the server checks the same.
    const local = logoProblem(file);
    setProblem(local);
    if (local) return;
    setBusy("uploading");
    try {
      await onSaveLogo(await readAsDataUrl(file));
    } catch (refused) {
      setProblem(fieldErrorOf(refused, "logo") ?? errorMessageOf(refused));
    } finally {
      setBusy(undefined);
    }
  };
  const remove = async () => {
    if (!onRemoveLogo || busy) return;
    setProblem(undefined);
    setBusy("removing");
    // A refusal is said by the wrapper.
    await onRemoveLogo().catch(() => {});
    setBusy(undefined);
  };
  return (
    <Card
      title="Logo"
      description="Shown in the top-left corner for everyone in the organisation. Without one, its initials stand in."
      actions={
        logo &&
        onRemoveLogo && (
          <Button variant="secondary" size="sm" icon={Trash2} aria-disabled={busy === "removing" || undefined} onClick={() => void remove()}>
            {busy === "removing" ? "Removing…" : "Remove"}
          </Button>
        )
      }
    >
      <Inline gap="md" align="start" stackOnMobile>
        <IconTile size="lg" tone={logo ? "white" : "dark"} image={logo} imageAlt={`${name} logo`}>
          {instanceInitials(name)}
        </IconTile>
        <Stack grow>
          {onSaveLogo ? (
            <FormField label={logo ? "Replace the logo" : "Upload a logo"} error={problem}>
              <FileDropzone
                compact
                accept={LOGO_ACCEPT}
                title={busy === "uploading" ? "Uploading…" : "Drop an image here or click to upload"}
                description="PNG, JPEG, SVG or WebP, up to 256 KB. A square image looks best."
                onFiles={(files) => void upload(files[0])}
              />
            </FormField>
          ) : (
            <Text tone="muted">{logo ? "Your organisation's logo." : "No logo yet, so its initials show."} Only admins change it.</Text>
          )}
        </Stack>
      </Inline>
    </Card>
  );
}

function GeneralSection({ name, logo, onRename, onSaveLogo, onRemoveLogo }: { name: string; logo?: string; onRename?: (name: string) => Promise<void> } & LogoActions) {
  const [draft, setDraft] = useState(name);
  // Set when Save is pressed with no name; the field says so until one is typed.
  const [missing, setMissing] = useState(false);
  const save = useSave(onRename);
  const trimmed = draft.trim();
  const submit = () => {
    if (!onRename || save.saving) return;
    setMissing(!trimmed);
    if (focusFirstProblem([["organization-name", !trimmed]])) return;
    void save.run(trimmed);
  };
  const refused = save.error !== undefined ? (fieldErrorOf(save.error, "name") ?? errorMessageOf(save.error)) : undefined;
  return (
    <Stack gap="lg">
      <SectionHeading title="General" description="How your organisation is named and shown across OpenFn." />
      <Card title="Name" description="Shown to everyone in the organisation, and to anyone you share projects, systems or services with.">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Inline align="end" gap="sm" stackOnMobile>
            <Stack grow>
              <FormField label="Organization name" htmlFor="organization-name" required={!!onRename} error={missing && !trimmed ? "Enter a name for the organisation" : refused}>
                <TextInput id="organization-name" value={draft} readOnly={!onRename} onChange={(e) => setDraft(e.target.value)} />
              </FormField>
            </Stack>
            {/* Enabled until it saves: pressed with no name, it says so under the field. */}
            {onRename && (
              <Button type="submit" icon={Save} aria-disabled={save.saving}>
                {save.saving ? "Saving…" : "Save"}
              </Button>
            )}
          </Inline>
        </form>
      </Card>
      <LogoCard name={name} logo={logo} onSaveLogo={onSaveLogo} onRemoveLogo={onRemoveLogo} />
    </Stack>
  );
}

/* ------------------------------------------------------------------ */
/*  Members                                                            */
/* ------------------------------------------------------------------ */

const roleTones = { Admin: "green", Member: "gray" } as const;

interface MemberActions {
  /** The roles you may give. Left out with the actions when you can't manage members. */
  assignableRoles?: OrganizationMember["role"][];
  /** Adds someone already on OpenFn, by email, with a role. */
  onInviteMember?: (invite: OrganizationInvite) => Promise<void>;
  /** Gives a member another role, by their user id. The organisation always keeps an admin. */
  onChangeMemberRole?: (memberId: string, role: OrganizationMember["role"]) => Promise<void>;
  /** Takes a member out of the organisation, by their user id. Their projects keep them. */
  onRemoveMember?: (memberId: string) => Promise<void>;
}

function MembersSection({ members, name, assignableRoles = [], onInviteMember, onChangeMemberRole, onRemoveMember }: { members: OrganizationMember[]; name: string } & MemberActions) {
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<OrganizationMember>();
  // A change the server refuses, such as taking away the last admin, is said by the wrapper.
  const attempt = (work: () => Promise<void>) => work().catch(() => {});
  const actionsFor = (m: OrganizationMember) => {
    const roles = onChangeMemberRole ? assignableRoles.filter((r) => r !== m.role).map((r) => ({ id: `role:${r}`, label: `Make ${r.toLowerCase()}` })) : [];
    const remove = onRemoveMember ? [{ id: "remove", label: "Remove from organisation", tone: "danger" as const, divider: roles.length > 0 }] : [];
    return [...roles, ...remove];
  };
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
    { key: "role", header: "Org role", render: (m) => <Badge label={m.role} tone={roleTones[m.role]} /> },
    { key: "joined", header: "Joined", render: (m) => m.joined },
    ...(onChangeMemberRole || onRemoveMember
      ? [
          {
            key: "actions",
            header: "",
            align: "right" as const,
            render: (m: OrganizationMember) => {
              const items = actionsFor(m);
              return items.length > 0 ? (
                <ActionMenu
                  label={`Actions for ${m.name}`}
                  items={items}
                  onSelect={(id) => {
                    if (id === "remove") setRemoving(m);
                    else void attempt(() => onChangeMemberRole!(m.id, id.slice(5) as OrganizationMember["role"]));
                  }}
                />
              ) : null;
            },
          },
        ]
      : []),
  ];
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Members"
        description={`Everyone in the ${name}, and what they're allowed to do.`}
        action={
          onInviteMember && (
            <Button size="sm" icon={UserPlus} onClick={() => setInviting(true)}>
              Add member
            </Button>
          )
        }
      />
      <DataTable columns={columns} rows={members} getRowKey={(m) => m.id} />
      {inviting && onInviteMember && <InviteOrgMemberModal roles={assignableRoles} onInvite={onInviteMember} onClose={() => setInviting(false)} />}
      <ConfirmModal
        open={!!removing}
        title={`Remove ${removing?.name ?? ""}`}
        confirmLabel="Remove"
        tone="danger"
        onClose={() => setRemoving(undefined)}
        onConfirm={() => {
          const m = removing!;
          setRemoving(undefined);
          void attempt(() => onRemoveMember!(m.id));
        }}
      >
        {`${removing?.name ?? ""} loses access to the organisation's settings. Their projects keep them as members until they're removed there.`}
      </ConfirmModal>
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

type Visibility = OrganizationSettingsPageData["visibility"];

/** Saves something: the state behind each section's Save button. The wrapper says how it went; a refusal is kept for a form to show under its field. */
function useSave<T>(save: ((value: T) => Promise<void>) | undefined) {
  const [state, setState] = useState<{ saving?: boolean; saved?: boolean; error?: unknown }>({});
  const run = async (value: T) => {
    if (!save || state.saving) return;
    setState({ saving: true });
    try {
      await save(value);
      setState({ saved: true });
    } catch (error) {
      setState({ error });
    }
  };
  return { ...state, run };
}

function VisibilitySection({ initial, onSave }: { initial: Visibility; onSave?: (visibility: Visibility) => Promise<void> }) {
  const [visibility, setVisibility] = useState(initial);
  const save = useSave(onSave);
  const changed = visibilityKinds.some((k) => visibility[k.id] !== initial[k.id]);
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Visibility"
        description="The defaults for anything new. Each project, system and service can still change its own."
        action={
          onSave && (
            <Button size="sm" icon={Save} disabled={!changed} aria-disabled={save.saving} onClick={() => void save.run(visibility)}>
              {save.saving ? "Saving…" : "Save"}
            </Button>
          )
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
                disabled={!onSave}
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

function XRoadSection({
  xroad,
  xroadUsage,
  onSave,
}: {
  xroad: OrgXRoadSettings;
  xroadUsage: OrganizationSettingsPageData["xroadUsage"];
  onSave?: (managedBy: SecurityServerManager) => Promise<void>;
}) {
  const [managedBy, setManagedBy] = useState<SecurityServerManager>(xroad.managedBy);
  const save = useSave(onSave);
  const changed = managedBy !== xroad.managedBy;
  return (
    <div className="space-y-8">
      <SectionHeading
        title="X-Road"
        description="Who your organisation is on X-Road. OpenFn is a subsystem under your organisation, never a member of its own."
        action={
          onSave && (
            <Button size="sm" icon={Save} disabled={!changed} aria-disabled={save.saving} onClick={() => void save.run(managedBy)}>
              {save.saving ? "Saving…" : "Save"}
            </Button>
          )
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
                disabled={!onSave}
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

/** What Organization settings shows: the organisation's settings, as the API gives them. */
export type OrganizationSettingsPageData = OrganizationSettings;

export interface OrganizationSettingsPageProps extends PageProps<OrganizationSettingsPageData>, MemberActions, LogoActions {
  /** Renames the organisation. Left out when you can't change the organisation, which leaves the name to read. */
  onRename?: (name: string) => Promise<void>;
  /** Saves the defaults for what others can see. Left out when you can't change the organisation. */
  onSaveVisibility?: (visibility: OrganizationSettingsPageData["visibility"]) => Promise<void>;
  /** Saves who manages the organisation's Security Server. Left out when you can't change the organisation. */
  onSaveSecurityServerManager?: (managedBy: SecurityServerManager) => Promise<void>;
}

/**
 * The organisation's settings, from the account menu: everything it sets
 * once. Its name and logo, its members, what others can see by default, its identity on X-Road (which connected systems and published
 * services reuse), and billing.
 */
export default function OrganizationSettingsPage({
  node,
  ancestors,
  data,
  assignableRoles = organizationRoles,
  onInviteMember,
  onChangeMemberRole,
  onRemoveMember,
  onSaveVisibility,
  onSaveSecurityServerManager,
  onRename,
  onSaveLogo,
  onRemoveLogo,
}: OrganizationSettingsPageProps) {
  // Without X-Road there's no X-Road section. The /organization-settings root shows the first section.
  const items = navItems.filter((item) => item.id !== "xroad" || data.xroad);
  const activeId = items.some((item) => item.id === node.id) ? node.id : items[0].id;
  return (
    <SettingsLayout
      breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
      title="Organization settings"
      description={`Who's in the ${data.name}, what others can see, ${data.xroad ? "your identity on X-Road, " : ""}and billing.`}
      navItems={items}
      activeId={activeId}
    >
      {activeId === "general" && <GeneralSection name={data.name} logo={data.logo} onRename={onRename} onSaveLogo={onSaveLogo} onRemoveLogo={onRemoveLogo} />}
      {activeId === "members" && (
        <MembersSection
          members={data.members}
          name={data.name}
          assignableRoles={assignableRoles}
          onInviteMember={onInviteMember}
          onChangeMemberRole={onChangeMemberRole}
          onRemoveMember={onRemoveMember}
        />
      )}
      {activeId === "visibility" && <VisibilitySection initial={data.visibility} onSave={onSaveVisibility} />}
      {activeId === "xroad" && data.xroad && <XRoadSection xroad={data.xroad} xroadUsage={data.xroadUsage} onSave={onSaveSecurityServerManager} />}
      {activeId === "billing" && <BillingSection billing={data.billing} />}
    </SettingsLayout>
  );
}
