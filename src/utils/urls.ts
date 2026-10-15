/**
 * URLs Lightning builds from the instance's own address. The host is fixed
 * here; once wired it comes from the instance config.
 */
import type { AuthProvider } from "../types/admin";

/** Base URL the proxy URLs hang off (`LightningWeb.Endpoint.url()`). */
export const channelProxyBase = "https://app.openfn.org";

export function channelProxyUrl(channelId: string): string {
  return `${channelProxyBase}/channels/${channelId}`;
}

/** The webhook URL Lightning shows for a trigger. */
export function webhookUrl(triggerId: string): string {
  return `https://app.openfn.org/i/${triggerId}`;
}

export function authRedirectUri(provider: Pick<AuthProvider, "redirectHost" | "name">): string {
  return `${provider.redirectHost.replace(/\/$/, "")}/authenticate/${provider.name}/callback`;
}
