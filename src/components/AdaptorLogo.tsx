import { Globe } from "lucide-react";
import { adaptorForSystem, adaptorLogoUrl } from "../adaptor-lookup";

type Size = "2xs" | "xs" | "sm" | "md" | "lg";

const boxSize: Record<Size, string> = {
  "2xs": "h-4 w-4 rounded",
  xs: "h-5 w-5 rounded",
  sm: "h-8 w-8 rounded-lg",
  md: "h-10 w-10 rounded-lg",
  lg: "h-12 w-12 rounded-xl",
};

const iconSize: Record<Size, number> = { "2xs": 10, xs: 12, sm: 16, md: 20, lg: 24 };

interface Props {
  /** Adaptor package id, e.g. "dhis2" or "googlesheets". */
  adaptor?: string;
  /** System name, used for alt text and to find the adaptor when `adaptor` isn't given. */
  name?: string;
  size?: Size;
}

/**
 * An adaptor's logo from the OpenFn adaptors repo, on a white tile. Falls
 * back to a globe for systems without a logo.
 */
export default function AdaptorLogo({ adaptor, name, size = "md" }: Props) {
  const url = adaptorLogoUrl(adaptor ?? adaptorForSystem(name));
  return (
    <span
      className={`inline-flex flex-shrink-0 items-center justify-center overflow-hidden border border-gray-200 bg-white ${boxSize[size]}`}
    >
      {url ? (
        <img src={url} alt={name ? `${name} logo` : ""} className="h-full w-full object-contain" />
      ) : (
        <Globe size={iconSize[size]} className="text-gray-400" />
      )}
    </span>
  );
}
