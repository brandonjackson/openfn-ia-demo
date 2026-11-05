import { useSyncExternalStore } from "react";
import {
  allFlagsOn,
  effectiveFlags,
  isFlagId,
  parseFlagsParam,
  type FeatureFlags,
  type FlagId,
} from "../model/feature-flags";

/**
 * Which feature flags are chosen. A `flags` parameter in the URL wins (so a
 * link can open either version of the demo), then the last choice made in
 * the flag panel, then everything on. Wrappers read the flags in effect with
 * {@link useFlags} and leave out what's off; pages never read them.
 */
const STORAGE_KEY = "openfn-ia-demo:feature-flags";

function fromUrl(): FeatureFlags | undefined {
  if (typeof window === "undefined") return undefined;
  const { search, hash } = window.location;
  const value =
    new URLSearchParams(search).get("flags") ??
    new URLSearchParams(hash.split("?")[1] ?? "").get("flags");
  return value ? parseFlagsParam(value) : undefined;
}

function fromStorage(): FeatureFlags | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const stored = JSON.parse(raw) as Record<string, boolean>;
    // Flags added since the choice was saved start on.
    const flags = { ...allFlagsOn };
    for (const [id, on] of Object.entries(stored)) if (isFlagId(id)) flags[id] = on;
    return flags;
  } catch {
    return undefined;
  }
}

let chosen: FeatureFlags = fromUrl() ?? fromStorage() ?? allFlagsOn;
let effective: FeatureFlags = effectiveFlags(chosen);
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Drops a `flags` parameter from the address bar once the panel takes over, so a reload keeps the panel's choice. */
function clearUrlParam() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const [route, query] = url.hash.split("?");
  const hashParams = new URLSearchParams(query ?? "");
  if (!url.searchParams.has("flags") && !hashParams.has("flags")) return;
  url.searchParams.delete("flags");
  hashParams.delete("flags");
  url.hash = hashParams.size > 0 ? `${route}?${hashParams}` : route;
  window.history.replaceState(window.history.state, "", url);
}

/** Replaces every choice, e.g. with a preset. */
export function setFlags(next: FeatureFlags) {
  chosen = next;
  effective = effectiveFlags(chosen);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chosen));
  } catch {
    // Storage can be unavailable; the choice still holds for this session.
  }
  clearUrlParam();
  listeners.forEach((l) => l());
}

/** A link to the demo, as it's open now, with these choices. */
export function shareUrl(param: string): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.set("flags", param);
  return url.toString();
}

/** Turns one flag on or off. */
export function setFlag(id: FlagId, on: boolean) {
  setFlags({ ...chosen, [id]: on });
}

/** The flags as chosen in the panel, before requirements are applied. */
export function useChosenFlags(): FeatureFlags {
  return useSyncExternalStore(subscribe, () => chosen);
}

/** The flags in effect. What wrappers and the shell read. */
export function useFlags(): FeatureFlags {
  return useSyncExternalStore(subscribe, () => effective);
}
