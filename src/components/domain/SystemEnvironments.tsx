import { AlertCircle, Globe, KeyRound, Pencil } from "lucide-react";
import type { SystemEnvironment } from "../../model/connected-systems";
import type { Environment } from "../../model/credentials";
import { ENVIRONMENTS } from "../../model/credentials";
import Button from "../primitives/Button";
import EnvironmentBadge from "./EnvironmentBadge";
import Card from "../primitives/Card";

// What's lost if an environment has no credential, so the gap reads as a choice.
const missingHint: Record<Environment, string> = {
  production: "workflows can't run against the live system.",
  staging: "changes can't be tested against a real, non-production instance.",
  mock: "workflows can't be built without touching a real system.",
};

interface Props {
  environments: Record<Environment, SystemEnvironment>;
  /** Opens one environment to edit where the system lives there. Left out (reading only), there's no Edit. */
  onEdit?: (environment: Environment) => void;
}

/**
 * One row per environment (production, staging, mock) showing where a
 * connected system lives in that environment and which credential reaches it,
 * with an Edit on each when it's given `onEdit`.
 */
export default function SystemEnvironments({ environments, onEdit }: Props) {
  return (
    <Card flush className="divide-y divide-gray-100">
      {ENVIRONMENTS.map((env) => {
        const { url, credential } = environments[env];
        return (
          <div key={env} className="flex items-start gap-4 px-4 py-3">
            <div className="w-28 flex-shrink-0 pt-0.5">
              <EnvironmentBadge environment={env} />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Globe size={14} className="flex-shrink-0 text-gray-400" />
                {url ? (
                  <span className="truncate text-gray-700">{url}</span>
                ) : (
                  <span className="text-gray-400">No URL</span>
                )}
              </div>
              <div className="flex items-start gap-2 text-sm">
                {credential ? (
                  <>
                    <KeyRound size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                    <span className="font-mono text-gray-900">{credential}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-amber-400" />
                    <span className="text-gray-500">
                      No credential, so {missingHint[env]}
                    </span>
                  </>
                )}
              </div>
            </div>
            {onEdit && (
              <Button variant="secondary" size="xs" icon={Pencil} onClick={() => onEdit(env)} aria-label={`Edit ${env}`}>
                Edit
              </Button>
            )}
          </div>
        );
      })}
    </Card>
  );
}
