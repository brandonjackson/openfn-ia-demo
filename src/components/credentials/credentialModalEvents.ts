import { useEffect } from "react";

/** Modals the "Add new" menu can open (Lightning's `show_modal` targets). */
export type NewCredentialTarget = "new_credential" | "new_oauth_client" | "new_keychain_credential";

const EVENT = "credential-index:show-modal";

/**
 * Lightning's "Add new" menu lives in the page header but pushes `show_modal`
 * to the credential index component (phx-target="#credentials-index-component").
 * The demo does the same with a window event so the two stay decoupled.
 */
export function showCredentialModal(target: NewCredentialTarget) {
  window.dispatchEvent(new CustomEvent<NewCredentialTarget>(EVENT, { detail: target }));
}

export function useCredentialModalRequests(onRequest: (target: NewCredentialTarget) => void) {
  useEffect(() => {
    const handler = (e: Event) => onRequest((e as CustomEvent<NewCredentialTarget>).detail);
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [onRequest]);
}

export interface NewCredentialOption {
  target: NewCredentialTarget;
  label: string;
  badge?: string;
  disabled?: boolean;
}

/** /credentials: Credential and OAuth Client (credential_live/index.html.heex). */
export const userCredentialMenuOptions: NewCredentialOption[] = [
  { target: "new_credential", label: "Credential" },
  { target: "new_oauth_client", label: "OAuth Client", badge: "Advanced" },
];

/** Project settings › Credentials adds Keychain (project_live/settings.html.heex:315-348). */
export function projectCredentialMenuOptions(canCreate: boolean, canCreateKeychain: boolean): NewCredentialOption[] {
  return [
    { target: "new_credential", label: "Credential", disabled: !canCreate },
    { target: "new_keychain_credential", label: "Keychain", disabled: !canCreateKeychain },
    { target: "new_oauth_client", label: "OAuth Client", badge: "Advanced", disabled: !canCreate },
  ];
}

