import { Navigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import ProjectBreadcrumbs from "../../components/shell/ProjectBreadcrumbs";
import DataclipDetailsCard, { DataclipBodyCard } from "../../components/history/DataclipDetailsCard";
import JsonViewer from "../../components/history/JsonViewer";
import { findDataclip } from "../../mock-data/history";
import { dataclipUpdatedAt } from "../../mock-data/history-extra";
import { shortId } from "../../utils/format";
import { findProject } from "../../mock-data/projects";

/** Inventory view `dataclip-show` (DataclipLive.Show, dataclip_live/show.ex). */
export default function DataclipShowPage() {
  const { projectId = "", dataclipId = "" } = useParams();
  const project = findProject(projectId);
  const dataclip = findDataclip(dataclipId);

  // Lightning flashes "Dataclip not found" and sends you to History.
  if (!dataclip || dataclip.projectId !== projectId) return <Navigate to={`/projects/${projectId}/history`} replace />;

  return (
    <PageContent
      header={
        <Header
          breadcrumbs={
            project && (
              <ProjectBreadcrumbs
                project={project}
                current={
                  <>
                    Dataclip
                    <span className="pl-2 font-light">{shortId(dataclip.id)}</span>
                  </>
                }
              />
            )
          }
        />
      }
    >
      <Centered>
        <DataclipDetailsCard dataclip={dataclip} updatedAt={dataclipUpdatedAt(dataclip.id)} />
        <DataclipBodyCard dataclip={dataclip}>
          <JsonViewer value={dataclip.body} />
        </DataclipBodyCard>
      </Centered>
    </PageContent>
  );
}
