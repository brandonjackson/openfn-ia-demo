import { FlaskConical, Radio, ToyBrick } from "lucide-react";
import type { Environment } from "../../model/credentials";
import Badge from "../primitives/Badge";

const config = {
  production: { label: "Production", tone: "green", icon: Radio },
  staging: { label: "Staging", tone: "yellow", icon: FlaskConical },
  mock: { label: "Mock", tone: "indigo", icon: ToyBrick },
} as const;

const known = (name: string): name is Environment => name in config;

/**
 * The environment a credential or system endpoint belongs to: production,
 * staging or mock, each in its own colour. Lightning names environments
 * freely, so any other name is shown as it is, in a plain badge.
 */
export default function EnvironmentBadge({ environment }: { environment: Environment | (string & {}) }) {
  if (!known(environment)) return <Badge label={environment} />;
  const c = config[environment];
  return <Badge label={c.label} tone={c.tone} icon={c.icon} />;
}
