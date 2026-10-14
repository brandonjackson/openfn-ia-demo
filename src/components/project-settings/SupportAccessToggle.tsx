import Toggle from "../Toggle";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Only people who can edit the project see the toggle. */
  canEditProject: boolean;
}

/** settings.ex `support_access_toggle`: "Grant support access" plus an info tooltip. */
export default function SupportAccessToggle({ checked, onChange, canEditProject }: Props) {
  return (
    <div className="flex flex-row items-center mb-4">
      {canEditProject && (
        <div className="flex flex-row">
          <div>
            <Toggle checked={checked} onChange={onChange} label="Grant support access" />
          </div>
          <div>
            <span
              className="relative ml-1 cursor-pointer inline-block"
              title="Granting support access will allow all designated support users for this Lightning instance to access this project with editor permissions."
              aria-label="Granting support access will allow all designated support users for this Lightning instance to access this project with editor permissions."
            >
              <span className="hero-information-circle-solid w-4 h-4 text-primary-600 opacity-50" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
