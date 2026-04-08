import { Link } from "react-router-dom";
import {
  Lock,
  Users,
  Plus,
  Zap,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import type { ConnectedSystemSummary } from "../../page-data";
import SuggestedSystemsToAdd from "../../components/SuggestedSystemsToAdd";

interface Props {
  systems: ConnectedSystemSummary[];
  recommendedSystems: { name: string; description: string }[];
  recommended: number;
  onAddSystem?: (systemName?: string) => void;
}

export default function ConnectedSystemsSetupSection({
  systems,
  recommendedSystems,
  recommended,
  onAddSystem,
}: Props) {
  const total = systems.length;
  const sharedCount = systems.filter((s) => s.credentialType === "org").length;
  const privateCount = systems.filter((s) => s.credentialType === "user").length;

  return (
    <section className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Finish setting up your connected systems
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {total} of {recommended} recommended systems connected
            </p>
          </div>
        </div>
        <button
          onClick={() => onAddSystem?.()}
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={13} />
          Add a system
        </button>
      </div>

      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${(total / recommended) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {total}/{recommended}
          </span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2.5 uppercase tracking-wide">
            Connected ({total})
          </p>
          <ul className="space-y-1.5">
            {systems.map((system) => (
              <li
                key={system.id}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 hover:bg-gray-50"
              >
                <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-800 flex-1">{system.name}</span>
                {system.credentialType === "user" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    <Lock size={9} />
                    Private
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                    <Users size={9} />
                    Shared
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-4">
            <SuggestedSystemsToAdd suggestions={recommendedSystems} onSelect={onAddSystem} />
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3.5 space-y-2">
            <p className="text-xs font-semibold text-blue-800">
              Why connect your systems?
            </p>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2 text-xs text-blue-700">
                <span className="mt-0.5 flex-shrink-0">•</span>
                <span>
                  <strong>Connect once.</strong> Org-shared credentials mean everyone
                  on your team gets access — without sharing passwords.
                </span>
              </li>
              <li className="flex items-start gap-2 text-xs text-blue-700">
                <span className="mt-0.5 flex-shrink-0">•</span>
                <span>
                  <strong>Instant value.</strong> As soon as a system is connected you
                  get observability, channels, mock data, and credential management
                  out of the box.
                </span>
              </li>
              <li className="flex items-start gap-2 text-xs text-blue-700">
                <span className="mt-0.5 flex-shrink-0">•</span>
                <span>
                  <strong>Smart suggestions.</strong> The more systems you connect,
                  the smarter your service recommendations become.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4 flex items-center gap-2">
        <span className="text-xs text-gray-400">
          {sharedCount} shared · {privateCount} private
        </span>
        <Link
          to="/connected-systems"
          className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View all systems
          <ChevronRight size={12} />
        </Link>
      </div>
    </section>
  );
}
