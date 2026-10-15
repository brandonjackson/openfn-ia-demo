import { useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import ProjectBreadcrumbs from "../../components/shell/ProjectBreadcrumbs";
import ChannelFormModal from "../../components/projects/channels/ChannelFormModal";
import ChannelMetrics from "../../components/projects/channels/ChannelMetrics";
import ChannelsTable from "../../components/projects/channels/ChannelsTable";
import TableTitle from "../../components/TableTitle";
import { useToast } from "../../components/Toast";
import { channelsIn, findChannel, projectCredentialOptions, webhookAuthMethods } from "../../mock-data/channels";
import { findProject } from "../../mock-data/projects";
import { permissionsFor } from "../../permissions";
import { useCurrentUser } from "../../session/session";

/**
 * Inventory view `channels-index` (ChannelLive.Index): stats, the channels
 * table, and the New / Edit Channel modal at /channels/new and
 * /channels/:channelId/edit. Lightning only links here from the menu when
 * experimental features are on.
 */
export default function ChannelsIndexPage() {
  const { projectId, channelId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const project = findProject(projectId);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [deleted, setDeleted] = useState<string[]>([]);
  const toast = useToast();

  if (!project) return <Navigate to="/projects" replace />;

  const { canCreateChannel, canEditChannel, canDeleteChannel } = permissionsFor(project, user);
  const channels = channelsIn(project.id)
    .filter((c) => !deleted.includes(c.id))
    .map((c) => ({ ...c, enabled: enabled[c.id] ?? c.enabled }));
  const back = `/projects/${project.id}/channels`;
  const creating = pathname.endsWith("/channels/new");
  const editing = channelId ? findChannel(channelId) : undefined;
  const pageTitle = creating ? "New Channel" : editing ? "Edit Channel" : "Channels";

  return (
    <>
      <PageContent header={<Header breadcrumbs={<ProjectBreadcrumbs project={project} current={pageTitle} />} />}>
        <Centered>
          <ChannelMetrics
            totalChannels={channels.length}
            totalRequests={channels.reduce((sum, c) => sum + c.requestCount, 0)}
            projectId={project.id}
          />
          <TableTitle title="Channels" count={channels.length} className="mt-14">
            <Button
              id="new-channel-button"
              disabled={!canCreateChannel}
              tooltip={canCreateChannel ? undefined : "You are not authorized to perform this action."}
              onClick={() => navigate(`${back}/new`)}
            >
              New Channel
            </Button>
          </TableTitle>
          <ChannelsTable
            channels={channels}
            projectId={project.id}
            canEdit={canEditChannel}
            canDelete={canDeleteChannel}
            onToggle={(id, v) => {
              setEnabled((m) => ({ ...m, [id]: v }));
              toast("Channel updated");
            }}
            onEdit={(id) => navigate(`${back}/${id}/edit`)}
            onDelete={(id) => {
              setDeleted((d) => [...d, id]);
              toast("Channel deleted.");
            }}
          />
        </Centered>
      </PageContent>
      {(creating || editing) && (
        <ChannelFormModal
          key={editing?.id ?? "new"}
          channel={editing}
          projectId={project.id}
          credentialOptions={projectCredentialOptions}
          authMethodOptions={webhookAuthMethods}
          onClose={() => navigate(back)}
        />
      )}
    </>
  );
}
