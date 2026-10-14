/** Copy for the credential index's confirm modals (credential_index_component.ex). */
export function deleteOauthClientMessage(name: string) {
  return `You are about the delete the Oauth client "${name}" which may be used in other projects. All jobs dependent on this client will fail.`;
}

export function deleteKeychainMessage(name: string) {
  return `You are about the delete the keychain credential "${name}" which may be used in jobs. All jobs using this keychain credential will fail.`;
}
