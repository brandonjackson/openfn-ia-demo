import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";

interface SuggestedService {
  id: string;
  title: string;
  description: string;
  fromSystems: string[];
  toSystems: string[];
  category: string;
  why: string;
}

const systemColors: Record<string, string> = {
  DHIS2: "bg-blue-100 text-blue-700",
  Salesforce: "bg-sky-100 text-sky-700",
  CommCare: "bg-green-100 text-green-700",
  KoBoToolbox: "bg-orange-100 text-orange-700",
  "Google Sheets": "bg-emerald-100 text-emerald-700",
  "FHIR Server": "bg-purple-100 text-purple-700",
  OpenCRVS: "bg-rose-100 text-rose-700",
};

const suggestedServices: SuggestedService[] = [
  {
    id: "commcare-dhis2",
    title: "Mobile data sync to national reporting",
    description:
      "Automatically push form submissions from CommCare to DHIS2 aggregates — no manual exports, no data gaps.",
    fromSystems: ["CommCare"],
    toSystems: ["DHIS2"],
    category: "Data sync",
    why: "CommCare and DHIS2 are both connected. This is the most common integration for programs using both.",
  },
  {
    id: "opencrvs-dhis2",
    title: "Civil registration to population analytics",
    description:
      "Stream birth and death events from OpenCRVS into DHIS2 population dashboards in real time.",
    fromSystems: ["OpenCRVS"],
    toSystems: ["DHIS2"],
    category: "Event-driven",
    why: "OpenCRVS events can feed DHIS2 population data automatically — a high-value, low-effort integration.",
  },
  {
    id: "fhir-dhis2",
    title: "Patient record interoperability",
    description:
      "Translate HL7 FHIR patient records into DHIS2 tracked entities for longitudinal health tracking.",
    fromSystems: ["FHIR Server"],
    toSystems: ["DHIS2"],
    category: "Interoperability",
    why: "Your FHIR Server and DHIS2 are both connected — this is a standard HIE integration pattern.",
  },
  {
    id: "kobo-sheets",
    title: "Survey data to dashboard",
    description:
      "Push KoBoToolbox survey responses to Google Sheets automatically, keeping stakeholder dashboards up to date.",
    fromSystems: ["KoBoToolbox"],
    toSystems: ["Google Sheets"],
    category: "Reporting",
    why: "Both systems are connected and this is a popular lightweight reporting workflow.",
  },
];

const categoryColors: Record<string, string> = {
  "Data sync": "bg-blue-50 text-blue-700",
  "Event-driven": "bg-purple-50 text-purple-700",
  Interoperability: "bg-emerald-50 text-emerald-700",
  Reporting: "bg-orange-50 text-orange-700",
};

function SystemPill({ name }: { name: string }) {
  const color = systemColors[name] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {name}
    </span>
  );
}

function SystemFlow({ from, to }: { from: string[]; to: string[] }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {from.map((name) => (
        <SystemPill key={name} name={name} />
      ))}
      <ArrowRight size={12} className="text-gray-400 flex-shrink-0" />
      {to.map((name) => (
        <SystemPill key={name} name={name} />
      ))}
    </div>
  );
}

interface Props {
  connectedSystemCount?: number;
}

export default function SuggestedServicesSection({ connectedSystemCount = 7 }: Props) {
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
              Based on your {connectedSystemCount} connected systems
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
        {suggestedServices.map((service) => (
          <div
            key={service.id}
            className="rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      categoryColors[service.category] ?? "bg-gray-100 text-gray-600"
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

            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{service.description}</p>

            <SystemFlow from={service.fromSystems} to={service.toSystems} />

            <p className="mt-2.5 text-xs text-gray-400 italic leading-snug">{service.why}</p>

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
