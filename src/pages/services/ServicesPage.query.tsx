import { useNavigate } from "react-router-dom";
import type { PageRoute } from "../../app/ia-utils";
import Loaded from "../../app/Loaded";
import { useFlags } from "../../app/feature-flags";
import { pageFrame } from "../../app/page-frame";
import { useConnectedSystems, useSystemChannels } from "../../api/connected-systems";
import { useOrganization, useXRoadDirectory, type XRoadDirectory } from "../../api/organization";
import { useProjectList } from "../../api/projects";
import { useAllServices, type ServiceRecord } from "../../api/services";
import { combine } from "../../api/status";
import { connectionOf, type ConnectedSystem, type SystemChannel } from "../../model/connected-systems";
import { isOpenable } from "../../model/projects";
import type { ChannelCatalogEntry, UsedServiceEntry, WorkflowCatalogEntry } from "../../model/services";
import { findMember, findService, serviceIdOf } from "../../model/xroad";
import ServicesPage from "./ServicesPage";

/**
 * A Live service as the catalog lists it: under its section (or its
 * project's name when it has none), callable from a workflow, and over MCP
 * or X-Road once it's turned on there.
 */
function publishedEntry(service: ServiceRecord, xroad: boolean): WorkflowCatalogEntry {
  const projectName = service.projectName;
  return {
    kind: "workflow",
    id: service.id,
    name: service.name,
    description: service.description,
    project: projectName,
    projectPath: `/projects/${service.projectId}/services/${service.id}`,
    section: service.section ?? projectName,
    callableAs: ["workflow", ...(service.mcpEnabled ? (["mcp"] as const) : []), ...(xroad && service.xroad?.published ? (["xroad"] as const) : [])],
    mcpToolName: service.mcpToolName,
    usage: service.usage && { organisations: service.usage.organisations, calls30d: service.usage.calls30d },
  };
}

/** Something a system offers, named after the system. */
function channelEntry(channel: SystemChannel, system: ConnectedSystem): ChannelCatalogEntry {
  return {
    kind: "channel",
    id: channel.id,
    name: channel.name,
    description: channel.description,
    channelType: channel.channelType,
    system: system.name,
    systemPath: `/connected-systems/${system.id}`,
    section: channel.section,
  };
}

/** The service another member publishes, for each system you reach over X-Road, from the directory. */
function usedOverXRoad(systems: ConnectedSystem[], directory: XRoadDirectory): UsedServiceEntry[] {
  return systems.flatMap((system) => {
    const connection = connectionOf(system);
    if (connection.method !== "xroad") return [];
    const service = findService(directory.members, connection.route);
    if (!service) return [];
    const member = findMember(directory.members, connection.route.memberId);
    return [
      {
        id: `${system.id}-${service.code}`,
        name: service.name,
        description: service.description,
        system: system.name,
        systemPath: `/connected-systems/${system.id}`,
        adaptor: system.adaptor,
        connection: "xroad",
        xroadStatus: connection.status,
        owner: member?.name ?? system.owner,
        methods: service.methods,
        serviceId: serviceIdOf(directory.instance, member, connection.route),
        builtWithOpenFn: service.builtWithOpenFn,
        record: service.record,
      },
    ];
  });
}

/**
 * Feeds the Services catalog from the API: the organisation's Live services,
 * filed by who offers them, the channels its systems offer, the services it
 * uses over X-Road (its systems, named from the directory), the projects a
 * new workflow can start in and its MCP server. The page waits for all but
 * the MCP server, so neither half says there's nothing while it loads.
 * Without connected systems there's nothing it uses; without
 * X-Road, nothing is offered or used over it.
 */
export default function ServicesPageQuery({ route }: { route: PageRoute }) {
  const navigate = useNavigate();
  const flags = useFlags();
  const { status, services } = useAllServices();
  const { status: projectsStatus, projects } = useProjectList();
  const { status: systemsStatus, systems } = useConnectedSystems();
  const { status: channelsStatus, channels } = useSystemChannels(flags.connectedSystems);
  const { status: directoryStatus, directory } = useXRoadDirectory(flags.xroad && flags.connectedSystems);
  const { organization } = useOrganization();
  return (
    // With connected systems on, "Services we use" waits for them too, so it never says there are none while they load.
    <Loaded status={flags.connectedSystems ? combine(status, projectsStatus, systemsStatus, channelsStatus, directoryStatus) : combine(status, projectsStatus)} path={route.currentPath}>
      {() => {
        const published = services.map((s) => publishedEntry(s, flags.xroad));
        const offered = channels.flatMap((c) => {
          const system = systems.find((s) => s.id === c.systemId);
          return system ? [channelEntry(c, system)] : [];
        });
        return (
          <ServicesPage
            {...pageFrame(route)}
            data={{
              entries: [...offered, ...published],
              usedServices: directory ? usedOverXRoad(systems, directory) : [],
              mcpServerUrl: organization?.mcpServerUrl,
              projects: projects.filter((p) => isOpenable(p) && !p.parentId).map((p) => ({ id: p.id, name: p.name })),
              connectedSystems: flags.connectedSystems,
              xroad: flags.xroad,
            }}
            onStartWorkflow={(projectId, channelId) => navigate(`/workflow-editor/new?project=${projectId}&channel=${channelId}`)}
          />
        );
      }}
    </Loaded>
  );
}
