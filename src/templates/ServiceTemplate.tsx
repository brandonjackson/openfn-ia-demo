import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, ClipboardList, Clock, FileCode2, Folder, KeyRound, ListChecks, Network, Webhook, Workflow } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ServiceApiField, ServicePageData } from "../page-data";
import Badge from "../components/Badge";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Callout from "../components/Callout";
import CodeBlock from "../components/CodeBlock";
import DataTable from "../components/DataTable";
import type { DataTableColumn } from "../components/DataTable";
import PropertyList from "../components/PropertyList";
import type { Property } from "../components/PropertyList";
import SectionHeading from "../components/SectionHeading";
import TextLink from "../components/TextLink";
import UsageModeCard from "../components/UsageModeCard";
import CopyValue from "../components/CopyValue";
import PublishToXRoadModal from "../components/PublishToXRoadModal";
import ServiceRecordList from "../components/ServiceRecordList";
import StatTile from "../components/StatTile";
import { mcpToolSnippet, openApiUrl, webhookUrl, workflowCallSnippet, xroadCallerSnippet } from "../service-usage";
import { openfnClientId, orgXRoad } from "../mock-data/xroad";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: ServicePageData;
}

const fieldColumns: DataTableColumn<ServiceApiField>[] = [
  { key: "name", header: "Field", render: (f) => <code className="font-mono text-sm text-gray-900">{f.name}</code> },
  { key: "type", header: "Type", render: (f) => <code className="font-mono text-sm text-gray-500">{f.type}</code> },
  {
    key: "required",
    header: "Required",
    render: (f) => (f.required ? <Badge label="Required" tone="indigo" /> : <Badge label="Optional" />),
  },
  { key: "description", header: "Description", render: (f) => <span className="text-sm text-gray-600">{f.description}</span> },
];

/**
 * A published service's catalog entry: what it does, who uses it, the three
 * ways to call it (webhook, MCP and X-Road), what the catalogue records about
 * it, and what goes in and comes back, like an API docs page for the
 * workflow behind it. Any webhook-triggered workflow can be a service; its
 * trigger's annotations generate the OpenAPI 3 docs. Links through to that
 * workflow and its project.
 */
export default function ServiceTemplate({ ancestors, data }: Props) {
  const navigate = useNavigate();
  const { service, workflow, api } = data;
  const projectPath = `/projects/${data.projectId}`;
  const isWebhook = api.trigger === "webhook";
  const url = webhookUrl(api);
  const docsUrl = openApiUrl(api);
  const [mcpEnabled, setMcpEnabled] = useState(!!service.mcpEnabled);
  const [onXRoad, setOnXRoad] = useState(!!service.xroad?.published);
  const [publishOpen, setPublishOpen] = useState(false);
  const serviceCode = service.xroad?.serviceCode ?? service.id;
  const xroadServiceId = `${openfnClientId}/${serviceCode}`;

  const properties: Property[] = [
    { icon: Folder, label: "Project", value: <TextLink to={projectPath}>{data.projectName}</TextLink> },
    {
      icon: Workflow,
      label: "Workflow",
      value: workflow ? (
        <TextLink to={`/workflow-editor/${workflow.id}`}>
          <span className="font-mono">{workflow.name}</span>
        </TextLink>
      ) : (
        <span className="text-gray-400">Not linked yet</span>
      ),
    },
    {
      icon: isWebhook ? Webhook : Clock,
      label: isWebhook ? "Endpoint" : "Runs",
      value: isWebhook ? <code className="font-mono">{api.invocation}</code> : api.invocation,
    },
  ];
  if (api.auth) properties.push({ icon: KeyRound, label: "Auth", value: api.auth });
  if (isWebhook && docsUrl)
    properties.push({
      icon: FileCode2,
      label: "API docs",
      value: (
        <span>
          <TextLink href={docsUrl} variant="inline">
            OpenAPI 3
          </TextLink>
          <span className="ml-2 text-gray-500">generated from the webhook trigger's annotations</span>
        </span>
      ),
    });

  return (
    <div className="space-y-8">
      <div>
        <PageHeader
          breadcrumbs={{
            // The workflow comes last so it's one click back to editing it.
            ancestors: [
              ...ancestors.map((a) => ({ label: a.node.label, path: a.path })),
              ...(workflow ? [{ label: workflow.name, path: `/workflow-editor/${workflow.id}` }] : []),
            ],
            current: "Service listing",
          }}
          icon={ClipboardList}
          title={service.name}
          badges={
            <>
              <Badge label={service.status} />
              {onXRoad && <Badge label="On X-Road" tone="indigo" icon={Network} />}
            </>
          }
          description={service.description}
          actions={
            <>
              <Button variant="secondary" size="sm" onClick={() => navigate(projectPath)}>
                View project
              </Button>
              {workflow && (
                <Button icon={Workflow} size="sm" onClick={() => navigate(`/workflow-editor/${workflow.id}`)}>
                  Open workflow
                </Button>
              )}
            </>
          }
        />

        {service.usage && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <StatTile
              label="Organisations using it"
              value={service.usage.organisations}
              detail="Calling it in the last 30 days"
            />
            <StatTile
              label="Calls"
              value={service.usage.calls30d.toLocaleString()}
              detail="Last 30 days"
              trend={service.usage.trend}
            />
          </div>
        )}

        <div className="mt-6">
          <PropertyList properties={properties} />
        </div>

        {service.status === "Draft" && (
          <div className="mt-4">
            <Callout variant="warning" title="Not live yet">
              This service is still a draft, so other teams can't call it. Details may change before it goes
              live.
            </Callout>
          </div>
        )}
      </div>

      {isWebhook && (
        <section>
          <SectionHeading
            title="Three ways to call it"
            description="The same workflow answers each of them; only how the caller reaches it changes."
          />
          <div className="-mt-3 grid items-start gap-3 lg:grid-cols-3">
            <UsageModeCard
              icon={Webhook}
              title="Webhook"
              description="Any system, or a step in another workflow, can POST to the workflow's webhook."
            >
              <div className="space-y-3">
                {url && <CopyValue value={url} label="Copy webhook URL" />}
                <CodeBlock label="From another workflow" code={workflowCallSnippet(data.projectId, service, api)} />
              </div>
            </UsageModeCard>
            <UsageModeCard
              icon={Bot}
              title="MCP"
              description={
                mcpEnabled
                  ? "Agents connected to your organization's MCP server see this service as a tool and can call it."
                  : "Let AI agents call this service as a tool on your organization's MCP server."
              }
              badge="Preview"
            >
              {mcpEnabled ? (
                <CodeBlock label="Tool definition" code={mcpToolSnippet(service, api)} />
              ) : (
                <Button variant="outline-primary" size="sm" icon={Bot} onClick={() => setMcpEnabled(true)}>
                  Enable MCP
                </Button>
              )}
            </UsageModeCard>
            <UsageModeCard
              icon={Network}
              title="X-Road"
              description={
                onXRoad
                  ? `Other members call it through their Security Servers, as a service of your ${orgXRoad.subsystems.find((x) => x.openfn)?.code} subsystem.`
                  : "Offer it to other government members through your Security Server, with their identity on every call."
              }
            >
              {onXRoad ? (
                <div className="space-y-3">
                  <CopyValue value={xroadServiceId} label="Copy X-Road service ID" />
                  {service.xroad?.clients && (
                    <p className="text-xs text-gray-500">
                      Access granted to {service.xroad.clients.length} client subsystem
                      {service.xroad.clients.length === 1 ? "" : "s"}.
                    </p>
                  )}
                  <Button variant="secondary" size="sm" icon={ListChecks} onClick={() => setPublishOpen(true)}>
                    Publishing checklist
                  </Button>
                </div>
              ) : (
                <Button size="sm" icon={Network} onClick={() => setPublishOpen(true)}>
                  Publish to X-Road
                </Button>
              )}
            </UsageModeCard>
          </div>
        </section>
      )}

      {service.record && (
        <section>
          <SectionHeading
            title="Catalogue record"
            description="What other organisations see about this service before they ask to use it."
          />
          <ServiceRecordList record={service.record} />
        </section>
      )}

      {isWebhook && (
        <section>
          <SectionHeading title="Request" description="Send a JSON body with these fields." />
          <div className="-mt-3 space-y-4">
            {api.inputFields && (
              <DataTable columns={fieldColumns} rows={api.inputFields} getRowKey={(f) => f.name} />
            )}
            {api.requestExample && <CodeBlock label="Example request" code={api.requestExample} />}
            {onXRoad && <CodeBlock label="Who called, over X-Road" code={xroadCallerSnippet} tone="light" />}
          </div>
        </section>
      )}

      <section>
        <SectionHeading title={isWebhook ? "Response" : "Output"} description={api.outputDescription} />
        <div className="-mt-3">
          <CodeBlock label={isWebhook ? "Example response" : "Example output"} code={api.outputExample} />
        </div>
      </section>

      {isWebhook && url && docsUrl && (
        <PublishToXRoadModal
          open={publishOpen}
          onClose={() => setPublishOpen(false)}
          onPublished={() => {
            setOnXRoad(true);
            setPublishOpen(false);
          }}
          serviceName={service.name}
          serviceCode={serviceCode}
          descriptionUrl={docsUrl}
          backendUrl={url}
          subsystem={openfnClientId}
          clients={service.xroad?.clients}
          securityServer={orgXRoad.securityServers[0].address}
        />
      )}
    </div>
  );
}
