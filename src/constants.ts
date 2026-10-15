/**
 * Lightning's fixed vocabulary: option lists, labels and copy that are hard-coded
 * in its source rather than read from the database. Safe to import anywhere.
 */
import type { RunState, SearchFieldId, WorkOrderState } from "./types/history";
import type { HealthRange } from "./types/workflow-health";

/** Role options for the user form (User.RolesEnum, capitalised, sorted). */
export const userRoleOptions: [label: string, value: string][] = [
  ["Superuser", "superuser"],
  ["User", "user"],
];

/** Lightning's User contact_preference enum (enum_options): label, value. */
export const contactPreferenceOptions: [label: string, value: string][] = [
  ["Critical", "critical"],
  ["Anytime", "any"],
];

export const contactPreferenceTooltip =
  "How often would you like to hear from us about your OpenFn account? Choose 'Anytime' to stay in up to date with all information, or 'Critical' if you prefer to be notified only about issues affecting your projects and account status.";

/** Roles offered when adding or inviting collaborators. */
export const collaboratorRoles = ["viewer", "editor", "admin"] as const;

export const digestOptions = ["never", "daily", "weekly", "monthly"] as const;

/** Status filter options (run_live/index.ex `statuses`). */
export const historyStatuses: { id: WorkOrderState | "running"; label: string }[] = [
  { id: "pending", label: "Enqueued" },
  { id: "running", label: "Running" },
  { id: "success", label: "Success" },
  { id: "failed", label: "Failed" },
  { id: "crashed", label: "Crashed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "killed", label: "Killed" },
  { id: "exception", label: "Exception" },
  { id: "lost", label: "Lost" },
  { id: "rejected", label: "Rejected" },
];

/** The "by" toggles next to the search box (run_live/index.ex `search_fields`). */
export const historySearchFields: { id: SearchFieldId; icon: string; label: string }[] = [
  { id: "id", icon: "hero-finger-print-mini", label: "Include IDs" },
  { id: "dataclip_name", icon: "hero-identification", label: "Include dataclip names" },
  {
    id: "body",
    icon: "hero-document-arrow-down",
    label:
      "Include inputs (note that very large/complex inputs—often around 10MB—may not appear in string search due to a ts_vector index length limit of 1MB)",
  },
  { id: "log", icon: "hero-bars-arrow-down-mini", label: "Include run logs" },
];

/** States in which a work order is still in flight (no retry button). */
export const activeStates: WorkOrderState[] = ["pending", "available", "claimed", "started"];

/** Lightning's `Run.final_states`. */
export const finalRunStates: RunState[] = ["success", "failed", "crashed", "cancelled", "killed", "exception", "lost"];

/** The range picker's options; "7" is the default (`DEFAULT_DAYS`). */
export const HEALTH_RANGES: HealthRange[] = [
  { days: "1", label: "Last 24 hours" },
  { days: "7", label: "Last 7 days" },
  { days: "30", label: "Last 30 days" },
];

export const DEFAULT_HEALTH_DAYS: HealthRange["days"] = "7";

/** Lightning's sandbox colour palette (`SandboxLive.Components.@color_palette`). */
export const sandboxColorPalette = [
  "#870d4c",
  "#E33D63",
  "#E64A2E",
  "#F39B33",
  "#F4C644",
  "#fcde32",
  "#d6e819",
  "#9AD04E",
  "#E040FB",
  "#8E3FB1",
  "#5E3FB8",
  "#5AA1F0",
  "#68d6e2",
  "#4AC1CE",
  "#2E9B92",
  "#56B15A",
];

/** Adaptors that never need a credential (Lightning's ADAPTORS_WITHOUT_CREDENTIALS). */
export const ADAPTORS_WITHOUT_CREDENTIALS = ["common", "http"];

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
