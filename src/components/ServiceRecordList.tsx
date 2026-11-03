import { ArrowLeftRight, Building2, Lock, Scale, ShieldCheck, Tag, Target, Timer } from "lucide-react";
import type { ServiceClassification, ServiceRecord } from "../mock-data/xroad";
import Badge from "./Badge";
import type { BadgeTone } from "./Badge";
import PropertyList from "./PropertyList";

const classificationTones: Record<ServiceClassification, BadgeTone> = {
  Public: "green",
  Internal: "gray",
  Confidential: "yellow",
  Restricted: "red",
};

/** A service's classification, coloured by how tightly it's held. */
export function ClassificationBadge({ classification }: { classification: ServiceClassification }) {
  return <Badge label={classification} tone={classificationTones[classification]} icon={ShieldCheck} />;
}

/**
 * What the catalogue records about a service: who owns it, why it exists,
 * what data it exchanges and on what legal basis, how sensitive it is, its
 * SLA and version, and who may call it. Modelled on Madagascar's national
 * government API catalogue.
 */
export default function ServiceRecordList({ record }: { record: ServiceRecord }) {
  return (
    <PropertyList
      properties={[
        { icon: Building2, label: "Owner", value: record.owner },
        { icon: Target, label: "Purpose", value: record.purpose },
        { icon: ArrowLeftRight, label: "Data exchanged", value: record.dataExchanged },
        { icon: Scale, label: "Legal basis", value: record.legalBasis },
        { icon: ShieldCheck, label: "Classification", value: <ClassificationBadge classification={record.classification} /> },
        { icon: Timer, label: "SLA", value: record.sla },
        { icon: Tag, label: "Version", value: record.version },
        { icon: Lock, label: "Access conditions", value: record.accessConditions },
      ]}
    />
  );
}
