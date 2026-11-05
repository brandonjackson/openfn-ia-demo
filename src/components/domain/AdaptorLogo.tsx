import { Globe } from "lucide-react";
import IconTile from "../primitives/IconTile";
import type { IconTileSize } from "../primitives/IconTile";
import { adaptorForSystem, adaptorLogoUrl } from "./adaptor-lookup";

interface Props {
  /** Adaptor package id, e.g. "dhis2" or "googlesheets". */
  adaptor?: string;
  /** System name, used for alt text and to find the adaptor when `adaptor` isn't given. */
  name?: string;
  size?: IconTileSize;
}

/**
 * An adaptor's logo from the OpenFn adaptors repo, on a white tile: the one
 * way the app draws an adaptor or a system, on the canvas, in the explorer,
 * in pills and lists. An adaptor without a logo shows the first letters of
 * its name; a system we can't place shows a globe.
 */
export default function AdaptorLogo({ adaptor, name, size = "md" }: Props) {
  const id = adaptor ?? adaptorForSystem(name);
  const url = adaptorLogoUrl(id);
  if (url)
    return (
      <IconTile size={size} tone="white">
        <img src={url} alt={name ? `${name} logo` : ""} className="h-full w-full object-contain" />
      </IconTile>
    );
  if (adaptor)
    return (
      <IconTile size={size} tone="dark">
        {adaptor.slice(0, 2)}
      </IconTile>
    );
  return <IconTile icon={Globe} size={size} tone="white" />;
}
