import { useState } from "react";
import { CreditCard, Layers, Plus, Unplug, UserPlus, Users } from "lucide-react";
import type { IANode } from "../ia-tree";
import type {
  BillingDetails,
  ContextLayer,
  InstanceMember,
  InstanceSettingsPageData,
} from "../page-data";
import SettingsLayout from "../components/SettingsLayout";
import type { SettingsNavItem } from "../components/SettingsNav";
import SectionHeading from "../components/SectionHeading";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import FormField from "../components/FormField";
import { TextInput } from "../components/FormControls";
import StatTile from "../components/StatTile";
import DataTable from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";

/* ------------------------------------------------------------------ */
/*  Section menu                                                       */
/* ------------------------------------------------------------------ */

const BASE_PATH = "/instance-settings";

const navItems: SettingsNavItem[] = [
  { id: "collaboration", label: "Collaboration", icon: Users, to: `${BASE_PATH}/collaboration` },
  { id: "billing", label: "Billing", icon: CreditCard, to: `${BASE_PATH}/billing` },
  { id: "context", label: "Context", icon: Layers, to: `${BASE_PATH}/context` },
];

/* ------------------------------------------------------------------ */
/*  Collaboration section                                              */
/* ------------------------------------------------------------------ */

const roleTones = { Owner: "blue", Admin: "green", Member: "gray" } as const;

function CollaborationSection({ members }: { members: InstanceMember[] }) {
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
        title="Collaboration"
        description="Everyone who can sign in to this instance, and what they're allowed to do."
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
/*  Billing section                                                    */
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
/*  Context section                                                    */
/* ------------------------------------------------------------------ */

function ContextSection({ initialLayers }: { initialLayers: ContextLayer[] }) {
  const [layers, setLayers] = useState(initialLayers);
  const [url, setUrl] = useState("");

  const requestAccess = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    let host = trimmed;
    try {
      host = new URL(trimmed).host;
    } catch {
      // Not a full URL; show what was typed.
    }
    setLayers([
      ...layers,
      { id: `layer-${Date.now()}`, name: host, host: trimmed, url: trimmed, status: "pending" },
    ]);
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
        <Button
          variant="secondary"
          size="xs"
          icon={Unplug}
          onClick={() => setLayers(layers.filter((x) => x.id !== l.id))}
        >
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
          description="Shared sources of handbook pages, systems and services that this instance draws on."
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
/*  Main template                                                      */
/* ------------------------------------------------------------------ */

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: InstanceSettingsPageData;
}

export default function InstanceSettingsTemplate({ node, ancestors, data }: Props) {
  // The /instance-settings root shows the first section.
  const activeId = navItems.some((item) => item.id === node.id) ? node.id : navItems[0].id;

  return (
    <SettingsLayout
      breadcrumbs={{
        ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
        current: node.label,
      }}
      title="Instance Settings"
      description="Manage who's in this instance, billing, and the context layers it draws on."
      navItems={navItems}
      activeId={activeId}
    >
      {activeId === "collaboration" && <CollaborationSection members={data.members} />}
      {activeId === "billing" && <BillingSection billing={data.billing} />}
      {activeId === "context" && <ContextSection initialLayers={data.contextLayers} />}
    </SettingsLayout>
  );
}
