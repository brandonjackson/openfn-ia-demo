import type { ReactNode } from "react";
import type { LiveDashboardData } from "../../types/admin";
import { cn } from "../../utils/cn";
import Alert from "../Alert";
import Card from "../Card";
import { DetailItem, DetailList } from "../DetailList";
import Heading from "../Heading";
import Pill from "../Pill";
import TextLink from "../TextLink";

type Data = LiveDashboardData;

const info = <span className="hero-information-circle h-4 w-4 text-gray-400" />;

function Stat({ label, value, hasInfo = false, className }: { label: string; value: ReactNode; hasInfo?: boolean; className?: string }) {
  return (
    <Card className={className}>
      {label} {hasInfo && info}
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </Card>
  );
}

function Limit({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = (used / limit) * 100;
  return (
    <Card padding="lg">
      <div className="flex justify-between">
        <span>
          {label} {info}
        </span>
        <span>
          <span className="mr-3 text-gray-400">
            {used} / {limit}
          </span>
          <span className="font-semibold">{pct.toFixed(1)}%</span>
        </span>
      </div>
      <div className="mt-3 h-4 overflow-hidden rounded-sm bg-gray-200">
        <div className="h-full bg-blue-400" style={{ width: `${Math.max(pct, 0.3)}%` }} />
      </div>
    </Card>
  );
}

/**
 * A static stand-in for Phoenix LiveDashboard's home page (/dashboard).
 * LiveDashboard is a third-party library with its own full-page layout, so
 * the route sits outside the app shell and the page is labelled as an
 * approximation.
 */
export default function LiveDashboardHome({ data }: { data: Data }) {
  const totalMemory = data.memory.reduce((s, m) => s + m.value, 0);
  const versions = [
    { label: "Elixir", value: data.versions.elixir, className: "from-purple-600 to-primary-500" },
    { label: "Phoenix", value: data.versions.phoenix, className: "from-orange-500 to-amber-500" },
    { label: "Dashboard", value: data.versions.dashboard, className: "from-blue-500 to-blue-600" },
  ];
  return (
    <div className="min-h-screen bg-gray-100 text-sm text-gray-700">
      <Alert type="warning" className="rounded-none">
        <div className="flex justify-between gap-2">
          <span>
            Static approximation of <strong>Phoenix LiveDashboard</strong>, a third-party page mounted by Lightning at
            /dashboard. Not interactive.
          </span>
          <TextLink to="/settings/projects">Back to Lightning</TextLink>
        </div>
      </Alert>
      <div className="h-28 bg-primary-900 text-white">
        <div className="mx-auto flex max-w-6xl justify-between pt-3">
          <h1 className="mt-8 text-3xl">Phoenix LiveDashboard</h1>
          <div className="flex flex-col items-end gap-2">
            {[
              ["Update every", "15s ⇕"],
              ["Selected node", "nonode@nohost ⇕"],
            ].map(([label, value]) => (
              <div key={label}>
                {label} <Pill>{value}</Pill>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto -mt-6 max-w-6xl">
        <Card className="flex flex-wrap gap-x-6 gap-y-1">
          {data.tabs.map((tab, i) => (
            <span key={tab} className={cn(i > 0 && "text-blue-500")}>
              {tab}
            </span>
          ))}
        </Card>

        <div className="mt-8 grid grid-cols-2 gap-6 pb-16">
          <div className="space-y-3">
            <Heading as="h2" size="lg">System information</Heading>
            <Card padding="lg">{data.systemInfo}</Card>
            <div className="grid grid-cols-3 gap-6 pt-3">
              {versions.map((v) => (
                <Stat key={v.label} {...v} className={cn("bg-gradient-to-br text-white", v.className)} />
              ))}
              <Stat label="Uptime" value={data.uptime} />
              <Stat label="Total input" value={data.totalInput} hasInfo />
              <Stat label="Total output" value={data.totalOutput} hasInfo />
            </div>
            <Heading as="h2" size="lg" className="pt-3">Run queues</Heading>
            <div className="grid grid-cols-3 gap-6">
              <Stat label="Total" value={data.runQueues.total} hasInfo />
              <Stat label="CPU" value={data.runQueues.cpu} />
              <Stat label="IO" value={data.runQueues.io} />
            </div>
          </div>
          <div className="space-y-3">
            <Heading as="h2" size="lg">System limits</Heading>
            {data.limits.map((l) => (
              <Limit key={l.label} {...l} />
            ))}
            <Heading as="h2" size="lg" className="pt-3">Memory</Heading>
            <Card padding="lg" className="space-y-5">
              <div className="flex h-6 gap-0.5 overflow-hidden">
                {data.memory.map((m) => (
                  <div key={m.label} className={m.color} style={{ width: `${(m.value / totalMemory) * 100}%` }} />
                ))}
              </div>
              <DetailList>
                {data.memory.map((m) => (
                  <DetailItem
                    key={m.label}
                    label={
                      <span className="flex items-center gap-2">
                        <span className={cn("h-4 w-4 rounded-sm", m.color)} />
                        {m.label}
                      </span>
                    }
                  >
                    {m.value} MB
                  </DetailItem>
                ))}
              </DetailList>
              <Card muted padding="sm" className="text-center">
                Total usage: {totalMemory.toFixed(1)} MB
              </Card>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
