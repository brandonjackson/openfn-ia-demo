import { useState } from "react";
import Card from "../Card";
import SectionHeader from "../SectionHeader";
import { useToast } from "../Toast";
import Toggle from "../Toggle";
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
  const toast = useToast();
  const sandbox = !!parentProject;
  return (
    <>
      <SectionHeader
        title="Project security"
        subtitle="View and manage security settings for this project."
        permissionsSection={canEditProject || sandbox ? undefined : "multi-factor authentication settings."}
      />
      {sandbox && <SandboxSettingsBanner variant="inherited" parentProject={parentProject} />}
      <Card
        title={<span id="mfa-label">Multi-Factor Authentication</span>}
        description={
          <span id="mfa-description">
            Requiring multi-factor authentication (MFA) adds an additional layer of security by requiring users to
            enable MFA on their accounts before they are allowed access this project.
          </span>
        }
      >
        <div className="flex items-center gap-3">
          <Toggle
            id="toggle-mfa-switch"
            checked={requiresMfa}
            onChange={(on) => {
              setRequiresMfa(on);
              toast("Project MFA requirement updated successfully");
            }}
            disabled={!canRequireMfa || sandbox}
            tooltip={canEditProject ? undefined : "You do not have permission to perform this action"}
            labelledBy="require-mfa-label"
          />
          <span className="text-sm text-gray-500" id="require-mfa-label">
            <span className="font-medium text-gray-900">Require MFA?</span>{" "}
            {requiresMfa ? "(currently required for this project)" : "(currently optional for this project)"}
          </span>
        </div>
      </Card>
    </>
  );
}
