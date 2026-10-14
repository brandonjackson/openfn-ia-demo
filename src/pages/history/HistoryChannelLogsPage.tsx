import { useParams, useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import Tabs from "../../components/Tabs";
import ProjectBreadcrumbs from "../../components/ProjectBreadcrumbs";
import ChannelRequestsTable from "../../components/history/ChannelRequestsTable";
import FilterChip, { FilterMenu } from "../../components/history/FilterChip";
import { channelRequestsIn, channelsIn } from "../../mock-data/channel-requests";
import { historyChannelsEnabled } from "../../mock-data/history-extra";
import { findProject } from "../../mock-data/projects";

/** Inventory view `history-channel-logs` (RunLive.Index :channel_logs, channel_logs_component.ex). */
export default function HistoryChannelLogsPage() {
  const { projectId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const project = findProject(projectId);
  const channels = channelsIn(projectId);
  const channelId = searchParams.get("filters[channel_id]");
  const selected = channels.find((c) => c.id === channelId);
  const requests = channelRequestsIn(projectId)
    .filter((r) => !selected || r.channelId === selected.id)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  const setChannel = (id: string | null) => {
    if (id) searchParams.set("filters[channel_id]", id);
    else searchParams.delete("filters[channel_id]");
    setSearchParams(searchParams);
  };

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
        <div className="top-0 self-start mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              id="channel-filter-chip"
              active={selected !== undefined}
              onClear={() => setChannel(null)}
              dropdown={(close) => (
                <FilterMenu
                  options={[{ value: null, label: "All Channels" }, ...channels.map((c) => ({ value: c.id, label: c.name }))]}
                  selected={selected?.id ?? null}
                  onSelect={(v) => {
                    setChannel(v);
                    close();
                  }}
                />
              )}
            >
              Channel is {selected ? selected.name : "any"}
            </FilterChip>
          </div>
        </div>
        <ChannelRequestsTable requests={requests} projectId={projectId} />
      </Centered>
    </PageContent>
  );
}
