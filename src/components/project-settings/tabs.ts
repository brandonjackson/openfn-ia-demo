import type { SettingsTab } from "./SettingsTabs";

/** The project settings tabs, in Lightning's order (settings.html.heex:31-66). */
export const projectSettingsTabs: SettingsTab[] = [
  { hash: "project", label: "Setup", icon: "hero-clipboard" },
  { hash: "credentials", label: "Credentials", icon: "hero-key" },
  { hash: "collections", label: "Collections", icon: "hero-circle-stack" },
  { hash: "webhook_security", label: "Webhook Security", icon: "hero-lock-closed" },
  { hash: "collaboration", label: "Collaboration", icon: "hero-users" },
  { hash: "security", label: "Security", icon: "hero-lock-closed" },
  { hash: "vcs", label: "Sync to GitHub", icon: "hero-arrow-path" },
  { hash: "data-storage", label: "Data Storage", icon: "hero-square-3-stack-3d" },
  { hash: "history-exports", label: "History Exports", icon: "hero-folder-arrow-down" },
];

/** Tabbed.container's `default_hash`. */
export const defaultSettingsHash = "project";
