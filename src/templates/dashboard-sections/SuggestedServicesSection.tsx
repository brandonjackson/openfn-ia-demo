import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import type { SuggestedService, ConnectedSystemSummary } from "../../page-data";

interface Props {
  services: SuggestedService[];
  systems: ConnectedSystemSummary[];
}

const categoryColors: Record<string, string> = {
  "Data sync": "bg-blue-50 text-blue-700",
  "Event-driven": "bg-purple-50 text-purple-700",
  Interoperability: "bg-emerald-50 text-emerald-700",
  Reporting: "bg-orange-50 text-orange-700",
};

function SystemPill({ name, color }: { name: string; color: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {name}
    </span>
  );
}

function SystemFlow({
  from,
  to,
  systems,
}: {
  from: string[];
  to: string[];
  systems: ConnectedSystemSummary[];
}) {
  const allSystems = systems.reduce<Record<string, string>>(
    (acc, s) => ({ ...acc, [s.name]: s.color }),
    {}
  );
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {from.map((name) => (
        <SystemPill
          key={name}
          name={name}
          color={allSystems[name] ?? "bg-gray-100 text-gray-600"}
        />
      ))}
      <ArrowRight size={12} className="text-gray-400 flex-shrink-0" />
      {to.map((name) => (
        <SystemPill
          key={name}
          name={name}
          color={allSystems[name] ?? "bg-gray-100 text-gray-600"}
        />
      ))}
    </div>
  );
}

export default function SuggestedServicesSection({ services, systems }: Props) {
  const total = systems.length;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
            <Sparkles size={15} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Suggested services for your stack
            </h2>
            <p className="text-xs text-gray-500">
              Based on your {total} connected systems
            </p>
          </div>
        </div>
        <Link
          to="/service-catalog"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View service catalog
          <ChevronRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      categoryColors[service.category] ??
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {service.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 leading-snug">
                  {service.title}
                </h3>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              {service.description}
            </p>

            <SystemFlow
              from={service.fromSystems}
              to={service.toSystems}
              systems={systems}
            />

            <p className="mt-2.5 text-xs text-gray-400 italic leading-snug">
              {service.why}
            </p>

            <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between">
              <Link
                to="/service-builder"
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Start building
                <ArrowRight size={11} />
              </Link>
              <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-400 text-center">
        Connect more systems to unlock additional service suggestions.
      </p>
    </section>
  );
}
