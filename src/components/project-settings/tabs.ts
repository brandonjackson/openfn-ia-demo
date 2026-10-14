import type { Tab } from "../Tabs";

/** The project settings tabs, in Lightning's order (settings.html.heex:31-66). */
export const projectSettingsTabs: Tab[] = [
  { id: "project", to: { hash: "project" }, label: "Setup", icon: "hero-clipboard" },
  { id: "credentials", to: { hash: "credentials" }, label: "Credentials", icon: "hero-key" },
  { id: "collections", to: { hash: "collections" }, label: "Collections", icon: "hero-circle-stack" },
  { id: "webhook_security", to: { hash: "webhook_security" }, label: "Webhook Security", icon: "hero-lock-closed" },
  { id: "collaboration", to: { hash: "collaboration" }, label: "Collaboration", icon: "hero-users" },
  { id: "security", to: { hash: "security" }, label: "Security", icon: "hero-lock-closed" },
  { id: "vcs", to: { hash: "vcs" }, label: "Sync to GitHub", icon: "hero-arrow-path" },
  { id: "data-storage", to: { hash: "data-storage" }, label: "Data Storage", icon: "hero-square-3-stack-3d" },
  { id: "history-exports", to: { hash: "history-exports" }, label: "History Exports", icon: "hero-folder-arrow-down" },
];

/** Tabbed.container's `default_hash`. */
export const defaultSettingsHash = "project";
