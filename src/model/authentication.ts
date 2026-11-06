/** The single sign-on provider (api/authentication.md, /api/auth_provider). */

/** The instance's OpenID Connect provider for single sign-on. */
export interface AuthProviderConfig {
  /** Lower-case, used in the redirect URI, e.g. "sim-dtu-sso". */
  name: string;
  /** The provider's `.well-known/openid-configuration` URL. */
  discoveryUrl: string;
  clientId: string;
  /** Whether a client secret is stored. The secret itself never comes back. */
  hasClientSecret: boolean;
  /** Where this instance is served from, the start of the redirect URI. */
  redirectHost: string;
  /** Let people in with an email the provider hasn't marked as verified. Off by default. */
  allowUnverifiedEmail: boolean;
}

/** What a superuser fills in to set up or change the provider. */
export interface AuthProviderDraft extends Omit<AuthProviderConfig, "hasClientSecret"> {
  /** A new client secret. Blank keeps the one stored. */
  clientSecret: string;
}

/** The result of the last test of a discovery URL. */
export interface AuthProviderTest {
  /** The URL tested; a result only applies while the form still shows it. */
  discoveryUrl: string;
  ok: boolean;
  message: string;
}
