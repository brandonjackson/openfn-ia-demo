import Alert, { type AlertType } from "../Alert";
import TextLink from "../TextLink";
import type { Project } from "../../mock-data/projects";

type Variant = "local" | "editable" | "inherited";

interface Props {
  /**
   * local: settings only apply to the sandbox; editable: they sync to the
   * parent on merge; inherited: they come from the parent and are read-only.
   */
  variant: Variant;
  parentProject?: Project;
}

const alertTypes: Record<Variant, AlertType> = { local: "info", editable: "success", inherited: "warning" };

/** Lightning's `sandbox_settings_banner` (components/sandbox_settings_banner.ex). */
export default function SandboxSettingsBanner({ variant, parentProject }: Props) {
  return (
    <Alert type={alertTypes[variant]}>
      {variant === "local" &&
        "Changes you make here only apply to this sandbox and do not sync to the parent project on merge."}
      {variant === "editable" && "Changes you make here will sync to the parent project on merge."}
      {variant === "inherited" && (
        <>
          These settings are inherited from the parent project{" "}
          {parentProject && (
            <>
              (<TextLink to={`/projects/${parentProject.id}/settings`}>{parentProject.name}</TextLink>){" "}
            </>
          )}
          and cannot be changed here.
        </>
      )}
    </Alert>
  );
}
