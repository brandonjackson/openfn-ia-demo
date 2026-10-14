import SimpleDropdown from "../SimpleDropdown";
import { cn } from "../../utils/cn";
import { showCredentialModal, userCredentialMenuOptions, type NewCredentialOption } from "./credentialModalEvents";

interface Props {
  id?: string;
  options?: NewCredentialOption[];
}

/**
 * The "Add new" dropdown (Components.Credentials.new_credential_menu_button).
 * Each entry opens the matching modal in the CredentialIndex on the page.
 */
export default function NewCredentialMenuButton({ id = "credential-options-menu-button", options = userCredentialMenuOptions }: Props) {
  return (
    <SimpleDropdown id={id} label="Add new">
      {options.map((o) => (
        <span
          key={o.target}
          role="menuitem"
          tabIndex={-1}
          onClick={(e) => (o.disabled ? e.stopPropagation() : showCredentialModal(o.target))}
          className={cn(o.disabled ? "text-gray-400 cursor-not-allowed" : "cursor-pointer")}
        >
          {o.label}
          {o.badge && (
            <span className="ml-2 inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
              {o.badge}
            </span>
          )}
        </span>
      ))}
    </SimpleDropdown>
  );
}
// Re-exported so pages can import the menu and its option presets together.
// eslint-disable-next-line react-refresh/only-export-components
export { projectCredentialMenuOptions, userCredentialMenuOptions } from "./credentialModalEvents";
