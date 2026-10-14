import MetricCard from "../MetricCard";
import TextLink from "../../TextLink";

/** The two stat cards above the channels table: Total Channels and Total Requests. */
export default function ChannelMetrics({
  totalChannels,
  totalRequests,
  projectId,
}: {
  totalChannels: number;
  totalRequests: number;
  projectId: string;
}) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-6">
      <MetricCard title="Total Channels" value={totalChannels} />
      <MetricCard
        title="Total Requests"
        value={totalRequests}
        link={<TextLink to={`/projects/${projectId}/history/channels`}>View all</TextLink>}
      />
    </div>
  );
}
