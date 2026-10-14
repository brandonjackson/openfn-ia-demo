import { useState } from "react";
import SectionHeader from "../SectionHeader";
import PlainSwitch from "./PlainSwitch";
import SandboxSettingsBanner from "./SandboxSettingsBanner";
import type { Project } from "../../mock-data/projects";

interface Props {
  initialRequiresMfa: boolean;
  canEditProject: boolean;
  canRequireMfa: boolean;
  /** Set for a sandbox: MFA is inherited from the parent and read-only. */
  parentProject?: Project;
}

/** The Security tab (`#security`, settings.html.heex:681-756): the "Require MFA?" switch. */
export default function SecurityPanel({ initialRequiresMfa, canEditProject, canRequireMfa, parentProject }: Props) {
  const [requiresMfa, setRequiresMfa] = useState(initialRequiresMfa);
  const sandbox = !!parentProject;
  return (
    <>
      <SectionHeader
        title="Project security"
        subtitle="View and manage security settings for this project."
        permissionsSection={canEditProject || sandbox ? undefined : "multi-factor authentication settings."}
      />
      {sandbox && <SandboxSettingsBanner variant="inherited" parentProject={parentProject} />}
      <div className="bg-white p-4 rounded-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex flex-grow flex-col">
            <span className="text-sm font-medium leading-6 text-gray-900" id="mfa-label">
              Multi-Factor Authentication
            </span>
            <span className="text-sm text-gray-500" id="mfa-description">
              Requiring multi-factor authentication (MFA) adds an additional layer of security by requiring users to
              enable MFA on their accounts before they are allowed access this project.
            </span>
          </span>
        </div>
        <div>
          <div className="flex items-center">
            <PlainSwitch
              id="toggle-mfa-switch"
              checked={requiresMfa}
              onChange={setRequiresMfa}
              disabled={!canRequireMfa || sandbox}
              tooltip={canEditProject ? undefined : "You do not have permission to perform this action"}
              labelledBy="require-mfa-label"
            />
            <span className="ml-3 text-sm" id="require-mfa-label">
              <span className="font-medium text-gray-900">Require MFA?</span>{" "}
              <span className="text-gray-500">
                {requiresMfa ? "(currently required for this project)" : "(currently optional for this project)"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
