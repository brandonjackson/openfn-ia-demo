/**
 * Profile page settings (/profile). Static fixtures only.
 */

/** Lightning's User contact_preference enum (enum_options): label, value. */
export const contactPreferenceOptions: [label: string, value: string][] = [
  ["Critical", "critical"],
  ["Anytime", "any"],
];

export const contactPreferenceTooltip =
  "How often would you like to hear from us about your OpenFn account? Choose 'Anytime' to stay in up to date with all information, or 'Critical' if you prefer to be notified only about issues affecting your projects and account status.";

/** VersionControl.github_enabled?(): the demo instance has no GitHub app configured, like the reference. */
export const githubOauthEnabled = false;

/** Whether the user has run activity in projects (UserDeletionModal's footnote). */
export const hasActivityInProjects = true;

/** Fake TOTP secret shown by "this secret key" while setting up MFA. */
export const fakeTotpSecret = "DEMOFAKESECRETNOTREAL234";
