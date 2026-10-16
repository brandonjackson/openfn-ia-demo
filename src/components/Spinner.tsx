import { cn } from "../utils/cn";

/**
 * A spinning indicator for anything pending: inside a `Button`, beside a
 * label, or in place of content that is still loading. Sized with `size`;
 * takes the text colour of its parent.
 */
export default function Spinner({ size = "sm", label = "Loading", className }: { size?: "xs" | "sm" | "md" | "lg"; label?: string; className?: string }) {
  const sizes = { xs: "h-3 w-3", sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  return (
    <span role="status" aria-label={label} data-ui="spinner" className={cn("hero-arrow-path inline-block shrink-0 animate-spin", sizes[size], className)} />
  );
}
