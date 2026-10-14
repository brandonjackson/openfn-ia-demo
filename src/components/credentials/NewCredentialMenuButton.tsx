import ButtonMenu from "../ButtonMenu";
import { MenuItem } from "../Menu";
import Pill from "../Pill";
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
    <div id={id}>
      <ButtonMenu label="Add new" theme="primary">
        {options.map((o) => (
          <MenuItem key={o.target} disabled={o.disabled} onClick={() => showCredentialModal(o.target)}>
            {o.label}
            {o.badge && <Pill className="ml-2">{o.badge}</Pill>}
          </MenuItem>
        ))}
      </ButtonMenu>
    </div>
  );
}
// Re-exported so pages can import the menu and its option presets together.
// eslint-disable-next-line react-refresh/only-export-components
export { projectCredentialMenuOptions, userCredentialMenuOptions } from "./credentialModalEvents";
