import { useNavigate } from "react-router-dom";
import { Bot, ClipboardList, Clock, Folder, KeyRound, Webhook, Workflow } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ServiceApiField, ServicePageData } from "../page-data";
import Badge from "../components/Badge";
import Breadcrumbs from "../components/Breadcrumbs";
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
import { mcpToolSnippet, workflowCallSnippet } from "../service-usage";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: ServicePageData;
}

const fieldColumns: DataTableColumn<ServiceApiField>[] = [
  { key: "name", header: "Field", render: (f) => <code className="font-mono text-sm text-gray-900">{f.name}</code> },
  { key: "type", header: "Type", render: (f) => <span className="font-mono text-xs text-gray-500">{f.type}</span> },
  {
    key: "required",
    header: "Required",
    render: (f) => (f.required ? <Badge label="Required" tone="blue" /> : <span className="text-xs text-gray-400">Optional</span>),
  },
  { key: "description", header: "Description", render: (f) => <span className="text-sm text-gray-600">{f.description}</span> },
];

/**
 * A published service's catalog entry: what it does, how to call it, and what
 * comes back, like an API docs page for the workflow behind it. Links through
 * to that workflow and its project.
 */
export default function ServiceTemplate({ ancestors, data }: Props) {
  const navigate = useNavigate();
  const { service, workflow, api } = data;
  const projectPath = `/projects/${data.projectId}`;
  const isWebhook = api.trigger === "webhook";

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
      value: isWebhook ? <code className="font-mono text-xs">{api.invocation}</code> : api.invocation,
    },
  ];
  if (api.auth) properties.push({ icon: KeyRound, label: "Auth", value: api.auth });

  return (
    <div className="space-y-10">
      <div>
        <Breadcrumbs
          ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))}
          current={service.name}
        />

        <div className="mt-6 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-100">
              <ClipboardList size={22} className="text-gray-400" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-900">{service.name}</h1>
                <Badge label={service.status} />
              </div>
              <p className="mt-1 text-sm text-gray-500">{service.description}</p>
            </div>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(projectPath)}>
              View project
            </Button>
            {workflow && (
              <Button icon={Workflow} size="sm" onClick={() => navigate(`/workflow-editor/${workflow.id}`)}>
                Open workflow
              </Button>
            )}
          </div>
        </div>

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
            title="Use this service"
            description="Call it from another workflow, or let an AI agent call it as a tool."
          />
          <div className="-mt-3 grid items-start gap-3 lg:grid-cols-2">
            <UsageModeCard
              icon={Workflow}
              title="From a workflow"
              description="Add a step to any workflow in your organization. The response lands on state for the next step."
            >
              <CodeBlock label="Job code" code={workflowCallSnippet(data.projectId, service, api)} />
            </UsageModeCard>
            <UsageModeCard
              icon={Bot}
              title="As an agent tool (MCP)"
              description="Agents connected to your organization's MCP server see this service as a tool and can call it directly."
              badge="Preview"
            >
              <CodeBlock label="Tool definition" code={mcpToolSnippet(service, api)} />
            </UsageModeCard>
          </div>
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
          </div>
        </section>
      )}

      <section>
        <SectionHeading title={isWebhook ? "Response" : "Output"} description={api.outputDescription} />
        <div className="-mt-3">
          <CodeBlock label={isWebhook ? "Example response" : "Example output"} code={api.outputExample} />
        </div>
      </section>
    </div>
  );
}
