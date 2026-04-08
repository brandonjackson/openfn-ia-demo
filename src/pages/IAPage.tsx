import { useLocation } from "react-router-dom";
import { iaTree } from "../ia-tree";
import { findNodeByPath } from "../ia-utils";
import type { LookupResult } from "../ia-utils";
import { pageDataRegistry } from "../mock-data";
import { connectedSystems, systemAccessGrants } from "../mock-data/connected-systems";
import { projects } from "../mock-data/projects";
import { serviceCatalogData } from "../mock-data/service-catalog";
import { templateMap } from "../templates";
import PageShell from "../components/PageShell";
import type { DashboardPageData, DetailPageData, ProjectPageData, ProjectSettingsPageData, PageData } from "../page-data";
import DashboardTemplate from "../templates/DashboardTemplate";
import IAComparisonPage from "./IAComparisonPage";

/**
 * Build DetailPageData on the fly from the connectedSystems array.
 * Pulls matching channels from the service catalog for the system.
 * Every system gets a "Channels" section so the default HTTP channel appears.
 */
function buildSystemDetailData(systemId: string): DetailPageData | undefined {
  const system = connectedSystems.find((s) => s.id === systemId);
  if (!system) return undefined;

  // Find channels defined in the service catalog for this system
  const systemChannels = serviceCatalogData.entries.filter(
    (e) => e.kind === "channel" && e.systemPath === `/connected-systems/${systemId}`
  );

  return {
    pageType: "detail",
    headerBadge: {
      label: system.credentialType === "org" ? "Shared" : "Private",
      variant: system.credentialType === "org" ? "shared" : "private",
    },
    systemId: system.id,
    sections: [
      {
        id: "channels",
        title: "Channels",
        display: "cards" as const,
        items: systemChannels.map((ch) => ({
          id: ch.id,
          name: ch.name,
          description: ch.description,
          metadata: { channelType: ch.kind === "channel" ? ch.channelType : "" },
        })),
      },
    ],
    accessGrants: systemAccessGrants[systemId] ?? [],
  };
}

/**
 * Build ProjectPageData on the fly from the projects array.
 */
function buildProjectData(projectId: string): ProjectPageData | undefined {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return undefined;

  return {
    pageType: "project",
    projectId: project.id,
    services: project.services,
    components: project.components,
  };
}

/**
 * Build ProjectSettingsPageData for a given project.
 */
function buildProjectSettingsData(projectId: string): ProjectSettingsPageData | undefined {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return undefined;

  return {
    pageType: "project-settings",
    projectName: project.name.toLowerCase().replace(/\s+/g, "-"),
    projectEnvironment: "main",
    projectDescription: project.description,
    collaborators: [
      {
        name: "Brandon Jackson",
        email: "brandon@openfn.org",
        role: "Owner",
        isSelf: true,
        failureAlert: "Unavailable",
        digest: "Never",
      },
    ],
    orgCredentials: [
      { id: "cred-dhis2", name: "DHIS2 Production", system: "DHIS2", owner: "Org", hasAccess: true },
      { id: "cred-commcare", name: "CommCare HQ", system: "CommCare", owner: "Org", hasAccess: false },
      { id: "cred-kobo", name: "KoboToolbox", system: "Kobo", owner: "Org", hasAccess: true },
      { id: "cred-salesforce", name: "Salesforce Sandbox", system: "Salesforce", owner: "Org", hasAccess: false },
    ],
    retentionPeriod: "7 Days",
    ioDataPolicy: "retain",
    ioRetentionPeriod: "7 Days",
    mfaRequired: false,
    githubConnected: false,
    concurrencyDisabled: false,
  };
}

/**
 * Resolve dynamic data and node label overrides based on params.
 */
function resolveDynamic(
  result: LookupResult
): { node: typeof result.node; data: PageData | undefined } | null {
  const params = result.params;
  const hasDynamic = Object.keys(params).length > 0;

  if (!hasDynamic) {
    return {
      node: result.node,
      data: pageDataRegistry.get(result.node.id),
    };
  }

  // Connected system detail
  if (params["connected-system"]) {
    const slug = params["connected-system"];
    const system = connectedSystems.find((s) => s.id === slug);
    if (!system) return null;
    return {
      node: { ...result.node, label: system.name, description: system.description },
      data: buildSystemDetailData(slug),
    };
  }

  // Project page
  if (params["project"]) {
    const slug = params["project"];
    const project = projects.find((p) => p.id === slug);
    if (!project) return null;

    // Project settings page
    if (result.node.pageType === "project-settings") {
      return {
        node: result.node,
        data: buildProjectSettingsData(slug),
      };
    }

    return {
      node: { ...result.node, label: project.name, description: project.description },
      data: buildProjectData(slug),
    };
  }

  return { node: result.node, data: undefined };
}

export default function IAPage() {
  const location = useLocation();
  const pathname = location.pathname;

  // IA Comparison page
  if (pathname === "/ia-comparison") {
    return <IAComparisonPage />;
  }

  // Dashboard / home page
  if (pathname === "/" || pathname === "/overview") {
    const data = pageDataRegistry.get("overview") as DashboardPageData;
    return <DashboardTemplate data={data} />;
  }

  const result = findNodeByPath(iaTree, pathname);

  if (!result) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold text-gray-900">Page Not Found</h1>
        <p className="mt-2 text-gray-500">
          No IA node found for{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded">{pathname}</code>
        </p>
      </div>
    );
  }

  const resolved = resolveDynamic(result);

  if (!resolved) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold text-gray-900">Page Not Found</h1>
        <p className="mt-2 text-gray-500">
          No data found for{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded">{pathname}</code>
        </p>
      </div>
    );
  }

  const { node, data } = resolved;
  const pageType = node.pageType ?? "generic";
  const Template = templateMap[pageType];

  if (Template) {
    return (
      <Template
        node={node}
        ancestors={result.ancestors}
        currentPath={pathname}
        data={data}
      />
    );
  }

  // Fallback to generic PageShell
  return (
    <PageShell
      node={node}
      ancestors={result.ancestors}
      currentPath={pathname}
    />
  );
}
