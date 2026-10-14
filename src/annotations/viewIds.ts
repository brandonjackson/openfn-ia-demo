/**
 * Maps the current URL to the audit inventory id of the view it shows
 * (annotations/INVENTORY.md). The panel falls back to this when the mouse
 * isn't over an element with its own `data-annotation`.
 */

const SETTINGS_TABS: Record<string, string> = {
  "#project": "project-settings-setup",
  "#credentials": "project-settings-credentials",
  "#collections": "project-settings-collections",
  "#webhook_security": "project-settings-webhook-security",
  "#collaboration": "project-settings-collaborators",
  "#security": "project-settings-security",
  "#vcs": "project-settings-github-sync",
  "#data-storage": "project-settings-data-storage",
  "#history-exports": "project-settings-history-exports",
};

const P = "/projects/[^/]+";

const ROUTES: [RegExp, string][] = [
  [/^\/users\/log_in$/, "auth-login"],
  [/^\/users\/register$/, "auth-register"],
  [/^\/users\/reset_password(\/[^/]+)?$/, "auth-reset-password"],
  [/^\/users\/two-factor$/, "auth-two-factor"],
  [/^\/users\/confirm(\/[^/]+)?$/, "auth-confirm-account"],
  [/^\/users\/confirm-required$/, "auth-confirmation-required"],
  [/^\/auth\/confirm_access$/, "auth-confirm-access"],
  [/^\/first_setup$/, "first-setup"],
  [/^\/projects$/, "projects-dashboard"],
  [/^\/mfa_required$/, "mfa-required"],
  [new RegExp(`^${P}/w$`), "workflows-index"],
  [new RegExp(`^${P}/w/new$`), "workflow-editor-new"],
  [new RegExp(`^${P}/w/[^/]+/health$`), "workflow-health"],
  [new RegExp(`^${P}/sandboxes`), "sandboxes-index"],
  [new RegExp(`^${P}/channels`), "channels-index"],
  [new RegExp(`^${P}/history$`), "history-work-orders"],
  [new RegExp(`^${P}/history/channels$`), "history-channel-logs"],
  [new RegExp(`^${P}/history/channels/[^/]+$`), "channel-request-show"],
  [new RegExp(`^${P}/runs/[^/]+$`), "run-show"],
  [new RegExp(`^${P}/dataclips/[^/]+/show$`), "dataclip-show"],
  [/^\/credentials$/, "credentials-index"],
  [/^\/profile\/tokens/, "profile-tokens"],
  [/^\/profile\/auth\/backup_codes$/, "profile-backup-codes"],
  [/^\/profile\/[^/]+\/delete$/, "profile-delete-account"],
  [/^\/profile$/, "profile-account"],
  [/^\/settings\/users\/(new|[^/]+)$/, "admin-user-edit"],
  [/^\/settings\/users/, "admin-users"],
  [/^\/settings\/projects/, "admin-projects"],
  [/^\/settings\/audit$/, "admin-audit"],
  [/^\/settings\/maintenance$/, "admin-maintenance"],
  [/^\/settings\/authentication/, "admin-auth-providers"],
  [/^\/settings\/collections$/, "admin-collections"],
  [/^\/dashboard$/, "admin-live-dashboard"],
];

export function viewIdForLocation(pathname: string, search: string, hash: string): string | null {
  if (new RegExp(`^${P}/settings/delete$`).test(pathname)) return "project-settings-setup";
  if (new RegExp(`^${P}/settings$`).test(pathname)) return SETTINGS_TABS[hash] ?? "project-settings-setup";

  // The editor is one route; its panels are told apart by query params.
  if (new RegExp(`^${P}/w/[^/]+$`).test(pathname) && !pathname.endsWith("/new")) {
    const q = new URLSearchParams(search);
    if (q.get("panel") === "editor") return "workflow-editor-ide";
    if (q.has("run")) return "workflow-editor-run-viewer";
    if (q.has("chat")) return "workflow-editor-ai-assistant";
    if (q.has("job") || q.has("trigger") || q.has("edge")) return "workflow-editor-inspectors";
    return "workflow-editor-canvas";
  }

  for (const [re, id] of ROUTES) if (re.test(pathname)) return id;
  return null;
}
