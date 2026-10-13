import { AlertCircle, Globe, KeyRound, Plus } from "lucide-react";
import type { Environment, SystemEnvironment } from "../page-data";
import { ENVIRONMENTS } from "../page-data";
import Button from "./Button";
import EnvironmentBadge from "./EnvironmentBadge";

// What's lost if an environment has no credential, so the gap reads as a choice.
const missingHint: Record<Environment, string> = {
  production: "workflows can't run against the live system.",
  staging: "changes can't be tested against a real, non-production instance.",
  mock: "workflows can't be built without touching a real system.",
};

interface Props {
  environments: Record<Environment, SystemEnvironment>;
}

/**
 * One row per environment (production, staging, mock) showing where a
 * connected system lives in that environment and which credential reaches it.
 */
export default function SystemEnvironments({ environments }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
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
            {credential ? (
              <Button variant="secondary" size="xs">
                Edit
              </Button>
            ) : (
              <Button variant="outline-primary" size="xs" icon={Plus}>
                Add
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
