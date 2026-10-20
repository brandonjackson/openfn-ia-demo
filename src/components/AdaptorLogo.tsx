import { Globe } from "lucide-react";

// Square logos copied from github.com/OpenFn/adaptors (packages/<id>/assets/square.png).
const logos = import.meta.glob<string>("../assets/adaptors/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

/** URL of an adaptor's square logo, or undefined if we don't have one. */
function adaptorLogoUrl(adaptorId?: string): string | undefined {
  return adaptorId ? logos[`../assets/adaptors/${adaptorId}.png`] : undefined;
}

type Size = "xs" | "sm" | "md" | "lg";

const boxSize: Record<Size, string> = {
  xs: "h-5 w-5 rounded",
  sm: "h-8 w-8 rounded-lg",
  md: "h-10 w-10 rounded-lg",
  lg: "h-12 w-12 rounded-xl",
};

const iconSize: Record<Size, number> = { xs: 12, sm: 16, md: 20, lg: 24 };

interface Props {
  /** Adaptor package id, e.g. "dhis2" or "googlesheets". */
  adaptor?: string;
  /** Used for the image's alt text. */
  name?: string;
  size?: Size;
}

/**
 * An adaptor's logo from the OpenFn adaptors repo, on a white tile. Falls
 * back to a globe for systems without a logo.
 */
export default function AdaptorLogo({ adaptor, name, size = "md" }: Props) {
  const url = adaptorLogoUrl(adaptor);
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
