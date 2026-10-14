import { Link } from "react-router-dom";

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
    <div className="grid gap-6 grid-cols-2 mb-8">
      <div className="bg-white shadow rounded-lg py-2 px-6">
        <h2 className="text-sm text-gray-500">Total Channels</h2>
        <div className="text-3xl font-bold text-gray-800">{totalChannels}</div>
      </div>
      <div className="bg-white shadow rounded-lg py-2 px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-500">Total Requests</h2>
          <Link to={`/projects/${projectId}/history/channels`} className="text-xs text-indigo-600 hover:text-indigo-800">
            View all
          </Link>
        </div>
        <div className="text-3xl font-bold text-gray-800">{totalRequests}</div>
      </div>
    </div>
  );
}
