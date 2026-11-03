import { useState } from "react";
import { Building2, FileText, Network, Paperclip, RefreshCw, Route, Server, ShieldCheck } from "lucide-react";
import type { SystemConnection } from "../mock-data/connected-systems";
import {
  directoryMember,
  hasXRoadAccess,
  openfnClientId,
  orgXRoad,
  routeService,
  openfnSubsystem,
  routeServiceId,
  xroadHeaders,
} from "../mock-data/xroad";
import Badge from "./Badge";
import Button from "./Button";
import Card from "./Card";
import CopyValue from "./CopyValue";
import FormField from "./FormField";
import { TextInput } from "./FormControls";
import PropertyList from "./PropertyList";
import SectionHeading from "./SectionHeading";
import ServiceRecordList from "./ServiceRecordList";
import TextLink from "./TextLink";
import XRoadStatusTrack from "./XRoadStatusTrack";

type XRoadConnection = Extract<SystemConnection, { method: "xroad" }>;

interface Props {
  connection: XRoadConnection;
}

/** What OpenFn sends for each header on a call out. */
const outboundValues: Record<string, string> = {
  "X-Road-Client": openfnClientId,
  "X-Road-Id": "A new ID for each call, kept on the run",
  "X-Road-UserId": "Whoever started the run, when it was started by a person",
  "X-Road-Issue": "The work order's reference, when it has one",
};

/**
 * How a system is reached over X-Road: the member, subsystem and service it
 * routes to, where its connection is on the status track, the agreement
 * behind it, what `allowedMethods` says can be called, the headers OpenFn
 * adds to every call, and the service's catalogue record. Routing and
 * headers come from the organisation's X-Road settings, so there's nothing
 * here to configure per system.
 */
export default function XRoadConnectionDetails({ connection }: Props) {
  const { route } = connection;
  const member = directoryMember(route.memberId);
  const service = routeService(route);
  const access = hasXRoadAccess(connection.status);
  const [agreementRef, setAgreementRef] = useState(connection.agreement?.reference ?? "");

  return (
    <div className="space-y-8">
      <section>
        <SectionHeading
          title="X-Road route"
          description="Calls go through your Security Server, which adds your identity and forwards them to the provider's. Workflows only ever see the system."
        />
        <PropertyList
          properties={[
            {
              icon: Building2,
              label: "Member",
              value: (
                <span>
                  {member?.name}
                  {member && (
                    <code className="ml-2 font-mono text-xs text-gray-500">
                      {[orgXRoad.instance, member.memberClass, member.memberCode].join("/")}
                    </code>
                  )}
                </span>
              ),
            },
            { icon: Network, label: "Subsystem", value: <code className="font-mono">{route.subsystem}</code> },
            {
              icon: Route,
              label: "Service",
              value: (
                <div className="w-full max-w-md space-y-1">
                  <p>{service?.name ?? route.service}</p>
                  <CopyValue value={routeServiceId(route)} label="Copy service ID" />
                </div>
              ),
            },
            {
              icon: Server,
              label: "Through",
              value: (
                <span>
                  <code className="font-mono">{orgXRoad.securityServers[0].address}</code>
                  <span className="ml-2 text-gray-500">
                    from your <TextLink to="/organization-settings/xroad" variant="inline">X-Road settings</TextLink>
                  </span>
                </span>
              ),
            },
          ]}
        />
      </section>

      <section>
        <SectionHeading title="Status" description="Where getting access to this service has got to." />
        <Card>
          <XRoadStatusTrack status={connection.status} history={connection.history} />
        </Card>
      </section>

      <section>
        <SectionHeading title="Service agreement" description="The data sharing agreement that lets you call this service." />
        <Card>
          <FormField
            label="Agreement reference"
            htmlFor="agreement-ref"
            hint={
              connection.agreement?.signedOn
                ? `${connection.agreement.name}, signed ${connection.agreement.signedOn}`
                : connection.agreement
                  ? `${connection.agreement.name}, not signed yet`
                  : "A reference number, or a link to where the agreement is kept."
            }
          >
            <div className="flex items-center gap-2">
              <TextInput id="agreement-ref" value={agreementRef} onChange={(e) => setAgreementRef(e.target.value)} />
              <Button variant="secondary" size="sm" icon={Paperclip}>
                {connection.agreement?.signedOn ? "Replace file" : "Attach file"}
              </Button>
            </div>
          </FormField>
          {connection.agreement?.signedOn && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-500">
              <FileText size={12} />
              {connection.agreement.reference}.pdf
            </p>
          )}
        </Card>
      </section>

      <section>
        <SectionHeading
          title="Access"
          description={`Checked with allowedMethods ${connection.accessCheckedAt}.`}
          action={
            <Button variant="secondary" size="sm" icon={RefreshCw}>
              Check access
            </Button>
          }
        />
        <Card>
          {access ? (
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 text-sm text-gray-700">
                <ShieldCheck size={14} className="text-green-600" />
                The provider lets your {openfnSubsystem.code} subsystem call:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {connection.allowedMethods.map((m) => (
                  <code key={m} className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">
                    {m}
                  </code>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              No methods allowed yet. Calls will be refused with{" "}
              <span className="font-medium text-gray-900">"Access not granted by provider"</span> until the provider
              grants access to <code className="font-mono text-xs">{openfnClientId}</code>.
            </p>
          )}
        </Card>
      </section>

      <section>
        <SectionHeading
          title="Headers"
          description="Added to every call automatically. Job code never sets them."
        />
        <PropertyList
          properties={xroadHeaders.map((h) => ({
            label: h.name,
            value: (
              <span className="flex flex-wrap items-center gap-2">
                <span className={h.name === "X-Road-Client" ? "font-mono" : "text-gray-600"}>{outboundValues[h.name]}</span>
                {h.required && <Badge label="Required" tone="indigo" />}
              </span>
            ),
          }))}
        />
      </section>

      {service?.record && (
        <section>
          <SectionHeading title="Catalogue record" description="What the provider publishes about this service." />
          <ServiceRecordList record={service.record} />
        </section>
      )}
    </div>
  );
}
