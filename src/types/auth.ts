/** Logged-out views: instance auth config. Types only: no data, no behaviour. */

export interface SsoProvider {
  /** Admin-facing name of the OIDC provider (Settings > Authentication). */
  name: string;
  /** Lightning's `@auth_handler_url`: where "via external provider" goes. */
  handlerUrl: string;
}

export interface AuthConfig {
  /** `:allow_signup`. Off on demo.openfn.org, so /users/register shows the plain-text refusal. */
  allowSignup: boolean;
  /** An OIDC handler, if one is configured. Lightning supports one. */
  ssoProvider: SsoProvider | null;
  /** `:allow_first_setup`: true only on a fresh install with no superuser. */
  allowFirstSetup: boolean;
}

/** Which method the two-factor page asks for (`?authentication_type=`). */
export type TwoFactorMethod = "totp" | "backup_code";
