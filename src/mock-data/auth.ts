/**
 * Fixtures for the logged-out and onboarding views (auth-*, first-setup).
 * Lightning reads these from instance config (Lightning.Config.check_flag?,
 * the OIDC auth provider); here they are static flags. Static only: nothing
 * here authenticates anyone.
 *
 * For demoing, a page can override a flag from the query string, e.g.
 * /users/log_in?sso=1, /users/register?signup=1, /users/log_in?error=1.
 */

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

export const authConfig: AuthConfig = {
  allowSignup: false,
  ssoProvider: null,
  allowFirstSetup: true,
};

/** A configured provider, used when `?sso=1` is set and in stories. */
export const exampleSsoProvider: SsoProvider = {
  name: "Keycloak",
  handlerUrl: "/authenticate/keycloak",
};

/** Flags with query-string overrides applied (`sso`, `signup`). */
export function authFlags(search: string): AuthConfig {
  const q = new URLSearchParams(search);
  const flag = (key: string, fallback: boolean) => (q.has(key) ? q.get(key) !== "0" : fallback);
  return {
    ...authConfig,
    allowSignup: flag("signup", authConfig.allowSignup),
    ssoProvider: flag("sso", authConfig.ssoProvider !== null) ? (authConfig.ssoProvider ?? exampleSsoProvider) : null,
  };
}

/** router.ex `:allow_signup` block: sent as a bare text/plain 404. */
export const signupDisabledMessage =
  "Self-signup has been disabled for this instance. Please contact the administrator.";

/** Flash messages the controllers put on these pages. */
export const authMessages = {
  invalidLogin: "Invalid email or password",
  resetSent:
    "If your email is in our system, you will receive instructions to reset your password shortly.",
  resetInvalid: "Reset password link is invalid or it has expired.",
  confirmInvalid: "User confirmation link is invalid or it has expired.",
  confirmSent:
    "If your email is in our system and it has not been confirmed yet, you will receive an email with instructions shortly.",
  invalidTwoFactorCode: "Invalid two-factor authentication code",
  invalidPassword: "Invalid password! Try again.",
  invalidOtp: "Invalid OTP code! Try again.",
  resendThrottled:
    "You've asked for this a few times recently. Check your inbox and spam folder; you can request another in a few minutes.",
};

/** The signed-in but unconfirmed user shown on /users/confirm-required. */
export const unconfirmedUser = {
  firstName: "Una",
  lastName: "Confirmed",
  email: "una@example.org",
};

/** Which method the two-factor page asks for (`?authentication_type=`). */
export type TwoFactorMethod = "totp" | "backup_code";
