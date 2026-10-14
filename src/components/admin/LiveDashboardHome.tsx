import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { liveDashboard } from "../../mock-data/admin";
import { cn } from "../../utils/cn";

type Data = typeof liveDashboard;

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-md bg-white shadow-sm", className)}>{children}</div>;
}

function Info() {
  return <span className="hero-information-circle h-4 w-4 text-[#9aa0ad] align-[-2px]" />;
}

function Stat({ label, value, info = false, className }: { label: string; value: ReactNode; info?: boolean; className?: string }) {
  return (
    <Card className={cn("px-4 py-4", className)}>
      <div className="text-[15px]">
        {label} {info && <Info />}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </Card>
  );
}

function Limit({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = (used / limit) * 100;
  return (
    <Card className="px-5 py-6">
      <div className="flex items-center justify-between text-[15px]">
        <span>
          {label} <Info />
        </span>
        <span>
          <span className="text-[13px] text-[#9aa0ad] mr-3">
            {used} / {limit}
          </span>
          <span className="font-semibold">{pct.toFixed(1)}%</span>
        </span>
      </div>
      <div className="mt-3 h-4 rounded-sm bg-[#e8ebf1] overflow-hidden">
        <div className="h-full bg-[#5f8fd2]" style={{ width: `${Math.max(pct, 0.3)}%` }} />
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
export default function LiveDashboardHome({ data = liveDashboard }: { data?: Data }) {
  const totalMemory = data.memory.reduce((s, m) => s + m.value, 0);
  return (
    <div className="min-h-screen bg-[#e9edf5] text-[#3d4352] font-[Nunito,ui-sans-serif,system-ui,sans-serif]">
      <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-sm text-amber-900 flex items-center gap-2">
        <span className="hero-information-circle-solid h-5 w-5 text-amber-500" />
        <span>
          Static approximation of <strong>Phoenix LiveDashboard</strong>, a third-party page mounted by Lightning at
          /dashboard. Not interactive.
        </span>
        <div className="grow" />
        <Link to="/settings/projects" className="font-semibold underline">
          Back to Lightning
        </Link>
      </div>
      <div className="bg-[#4a4776] h-[118px]">
        <div className="max-w-[1116px] mx-auto pt-3 flex items-start justify-between text-white">
          <h1 className="mt-8 text-[28px] font-normal">Phoenix LiveDashboard</h1>
          <div className="flex flex-col items-end gap-2 text-sm text-white/85">
            <div>
              Update every{" "}
              <span className="ml-2 inline-block rounded bg-white/75 px-2 py-1 text-[#3d4352]">15s ⇕</span>
            </div>
            <div>
              Selected node{" "}
              <span className="ml-2 inline-block rounded bg-white/75 px-2 py-1 text-[#3d4352]">nonode@nohost ⇕</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1116px] mx-auto -mt-6">
        <Card className="px-6 py-3 flex flex-wrap gap-x-6 gap-y-1 text-[15px]">
          {data.tabs.map((tab, i) => (
            <span key={tab} className={i === 0 ? "text-[#3d4352]" : "text-[#5f8fd2]"}>
              {tab}
            </span>
          ))}
        </Card>

        <div className="mt-8 grid grid-cols-2 gap-6 pb-16">
          <div>
            <h2 className="text-xl mb-3">System information</h2>
            <Card className="px-5 py-5 text-[15px] leading-6">{data.systemInfo}</Card>
            <div className="mt-6 grid grid-cols-3 gap-6">
              <div className="rounded-md px-4 py-4 text-white bg-gradient-to-br from-[#6d4ab1] to-[#6b6fd8]">
                <div className="text-[15px]">Elixir</div>
                <div className="mt-1 text-2xl font-semibold">{data.versions.elixir}</div>
              </div>
              <div className="rounded-md px-4 py-4 text-white bg-gradient-to-br from-[#f1683e] to-[#e9a83b]">
                <div className="text-[15px]">Phoenix</div>
                <div className="mt-1 text-2xl font-semibold">{data.versions.phoenix}</div>
              </div>
              <div className="rounded-md px-4 py-4 text-white bg-gradient-to-br from-[#3a8fde] to-[#3f6fd6]">
                <div className="text-[15px]">Dashboard</div>
                <div className="mt-1 text-2xl font-semibold">{data.versions.dashboard}</div>
              </div>
              <Stat label="Uptime" value={data.uptime} />
              <Stat label="Total input" value={data.totalInput} info />
              <Stat label="Total output" value={data.totalOutput} info />
            </div>
            <h2 className="text-xl mt-6 mb-3">Run queues</h2>
            <div className="grid grid-cols-3 gap-6">
              <Stat label="Total" value={data.runQueues.total} info />
              <Stat label="CPU" value={data.runQueues.cpu} />
              <Stat label="IO" value={data.runQueues.io} />
            </div>
          </div>
          <div>
            <h2 className="text-xl mb-3">System limits</h2>
            <div className="flex flex-col gap-6">
              {data.limits.map((l) => (
                <Limit key={l.label} {...l} />
              ))}
            </div>
            <h2 className="text-xl mt-6 mb-3">Memory</h2>
            <Card className="px-5 py-5">
              <div className="flex h-6 gap-0.5 overflow-hidden">
                {data.memory.map((m) => (
                  <div key={m.label} className={m.color} style={{ width: `${(m.value / totalMemory) * 100}%` }} />
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[15px]">
                {data.memory.map((m) => (
                  <div key={m.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className={cn("inline-block h-4 w-4 rounded-sm", m.color)} />
                      {m.label}
                    </span>
                    <span className="text-[#9aa0ad]">{m.value} MB</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 bg-[#eef0f5] py-1.5 text-center text-[15px]">
                Total usage: {totalMemory.toFixed(1)} MB
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
