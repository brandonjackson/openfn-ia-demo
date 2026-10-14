import { Link } from "react-router-dom";
import Alert from "../Alert";
import type { Project } from "../../mock-data/projects";

interface Props {
  /**
   * local: settings only apply to the sandbox; editable: they sync to the
   * parent on merge; inherited: they come from the parent and are read-only.
   */
  variant: "local" | "editable" | "inherited";
  parentProject?: Project;
}

/** Lightning's `sandbox_settings_banner` (components/sandbox_settings_banner.ex). */
export default function SandboxSettingsBanner({ variant, parentProject }: Props) {
  if (variant === "local") {
    return (
      <Alert type="info" className="border border-blue-300">
        Changes you make here only apply to this sandbox and do not sync to the parent project on merge.
      </Alert>
    );
  }
  if (variant === "editable") {
    return (
      <Alert type="success" className="border border-green-400">
        Changes you make here will sync to the parent project on merge.
      </Alert>
    );
  }
  return (
    <Alert type="warning" className="border border-yellow-300">
      These settings are inherited from the parent project{" "}
      {parentProject && (
        <>
          (
          <Link to={`/projects/${parentProject.id}/settings`} className="font-medium underline">
            {parentProject.name}
          </Link>
          ){" "}
        </>
      )}
      and cannot be changed here.
    </Alert>
  );
}
