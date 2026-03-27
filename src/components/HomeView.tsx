import { Link } from "react-router-dom";
import {
  Lock,
  Users,
  Plus,
  ArrowRight,
  Zap,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import SuggestedSystemsToAdd from "./SuggestedSystemsToAdd";

interface ConnectedSystem {
  id: string;
  name: string;
  credentialType: "user" | "org";
  color: string;
}

interface SuggestedService {
  id: string;
  title: string;
  description: string;
  fromSystems: string[];
  toSystems: string[];
  category: string;
  why: string;
}

const connectedSystems: ConnectedSystem[] = [
  { id: "dhis2", name: "DHIS2", credentialType: "org", color: "bg-blue-100 text-blue-700" },
  { id: "salesforce", name: "Salesforce", credentialType: "org", color: "bg-sky-100 text-sky-700" },
  { id: "commcare", name: "CommCare", credentialType: "user", color: "bg-green-100 text-green-700" },
  { id: "kobo-toolbox", name: "KoBoToolbox", credentialType: "user", color: "bg-orange-100 text-orange-700" },
  { id: "google-sheets", name: "Google Sheets", credentialType: "org", color: "bg-emerald-100 text-emerald-700" },
  { id: "fhir", name: "FHIR Server", credentialType: "user", color: "bg-purple-100 text-purple-700" },
  { id: "opencrvs", name: "OpenCRVS", credentialType: "org", color: "bg-rose-100 text-rose-700" },
];

const recommendedToAdd = [
  { name: "OpenMRS", description: "Electronic medical records" },
  { name: "PostgreSQL", description: "Relational database" },
  { name: "WhatsApp Business", description: "Messaging & notifications" },
];

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
  "Interoperability": "bg-emerald-50 text-emerald-700",
  "Reporting": "bg-orange-50 text-orange-700",
};

function SystemPill({ name, color }: { name: string; color: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {name}
    </span>
  );
}

function SystemFlow({ from, to }: { from: string[]; to: string[] }) {
  const allSystems = connectedSystems.reduce<Record<string, string>>(
    (acc, s) => ({ ...acc, [s.name]: s.color }),
    {}
  );
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {from.map((name) => (
        <SystemPill key={name} name={name} color={allSystems[name] ?? "bg-gray-100 text-gray-600"} />
      ))}
      <ArrowRight size={12} className="text-gray-400 flex-shrink-0" />
      {to.map((name) => (
        <SystemPill key={name} name={name} color={allSystems[name] ?? "bg-gray-100 text-gray-600"} />
      ))}
    </div>
  );
}

export default function HomeView() {
  const sharedCount = connectedSystems.filter((s) => s.credentialType === "org").length;
  const privateCount = connectedSystems.filter((s) => s.credentialType === "user").length;
  const total = connectedSystems.length;
  const recommended = 10;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
        <p className="mt-1 text-gray-500 text-sm">
          Your integration platform at a glance.
        </p>
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Connected Systems</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Active Services</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">12</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Work Orders (24h)</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">347</p>
        </div>
      </div>

      {/* Finish setting up connected systems */}
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
          <Link
            to="/connected-systems"
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={13} />
            Add a system
          </Link>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${(total / recommended) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">{total}/{recommended}</span>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Connected now */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2.5 uppercase tracking-wide">
              Connected ({total})
            </p>
            <ul className="space-y-1.5">
              {connectedSystems.map((system) => (
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

          {/* Recommended to add */}
          <div>
            <div className="mb-4">
              <SuggestedSystemsToAdd suggestions={recommendedToAdd} />
            </div>

            {/* Value props */}
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3.5 space-y-2">
              <p className="text-xs font-semibold text-blue-800">Why connect your systems?</p>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2 text-xs text-blue-700">
                  <span className="mt-0.5 flex-shrink-0">•</span>
                  <span>
                    <strong>Connect once.</strong> Org-shared credentials mean everyone on your team
                    gets access — without sharing passwords.
                  </span>
                </li>
                <li className="flex items-start gap-2 text-xs text-blue-700">
                  <span className="mt-0.5 flex-shrink-0">•</span>
                  <span>
                    <strong>Instant value.</strong> As soon as a system is connected you get
                    observability, channels, mock data, and credential management out of the box.
                  </span>
                </li>
                <li className="flex items-start gap-2 text-xs text-blue-700">
                  <span className="mt-0.5 flex-shrink-0">•</span>
                  <span>
                    <strong>Smart suggestions.</strong> The more systems you connect, the smarter your
                    service recommendations become.
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

      {/* Suggested services */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
              <Sparkles size={15} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Suggested services for your stack</h2>
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
    </div>
  );
}
