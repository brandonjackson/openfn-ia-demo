import { FlaskConical, Radio, ToyBrick } from "lucide-react";
import type { Environment } from "../page-data";
import Badge from "./Badge";

const config = {
  production: { label: "Production", tone: "green", icon: Radio },
  staging: { label: "Staging", tone: "yellow", icon: FlaskConical },
  mock: { label: "Mock", tone: "blue", icon: ToyBrick },
} as const;

/** The environment a credential or system endpoint belongs to: production, staging or mock. */
export default function EnvironmentBadge({ environment }: { environment: Environment }) {
  const c = config[environment];
  return <Badge label={c.label} tone={c.tone} icon={c.icon} />;
}
