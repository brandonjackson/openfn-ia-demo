import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import Tabs from "../../components/Tabs";
import ProjectBreadcrumbs from "../../components/shell/ProjectBreadcrumbs";
import ChannelRequestsTable from "../../components/history/ChannelRequestsTable";
import FilterChip, { FilterMenu } from "../../components/history/FilterChip";
import { channelRequestsIn } from "../../mock-data/channel-requests";
import { channelsIn } from "../../mock-data/channels";
import { historyChannelsEnabled } from "../../mock-data/history-extra";
import { findProject } from "../../mock-data/projects";
import { useUrlParams } from "../../utils/useUrlParams";

/** Inventory view `history-channel-logs` (RunLive.Index :channel_logs, channel_logs_component.ex). */
export default function HistoryChannelLogsPage() {
  const { projectId = "" } = useParams();
  const { params, update } = useUrlParams();
  const project = findProject(projectId);
  const channels = channelsIn(projectId);
  const channelId = params["filters[channel_id]"] ?? null;
  const selected = channels.find((c) => c.id === channelId);
  const requests = channelRequestsIn(projectId)
    .filter((r) => !selected || r.channelId === selected.id)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  const setChannel = (id: string | null) => update({ "filters[channel_id]": id || null });

  return (
    <PageContent
      header={
        <Header breadcrumbs={project && <ProjectBreadcrumbs project={project} current="History" />}>
          {historyChannelsEnabled && (
            <Tabs
              variant="pill"
              label="History"
              active="channel-logs"
              tabs={[
                { id: "work-orders", label: "Work Orders", to: `/projects/${projectId}/history` },
                { id: "channel-logs", label: "Channel Logs", to: `/projects/${projectId}/history/channels` },
              ]}
            />
          )}
        </Header>
      }
    >
      <Centered>
        <div className="mb-4">
          <FilterChip
            id="channel-filter-chip"
            active={selected !== undefined}
            onClear={() => setChannel(null)}
            menu={
              <FilterMenu
                options={[{ value: null, label: "All Channels" }, ...channels.map((c) => ({ value: c.id, label: c.name }))]}
                selected={selected?.id ?? null}
                onSelect={setChannel}
              />
            }
          >
            Channel is {selected ? selected.name : "any"}
          </FilterChip>
        </div>
        <ChannelRequestsTable requests={requests} channels={channels} projectId={projectId} />
      </Centered>
    </PageContent>
  );
}
