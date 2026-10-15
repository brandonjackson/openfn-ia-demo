import { adaptorIconUrl, adaptorShortName } from "../../utils/adaptors";
import { cn } from "../../utils/cn";

const sizeClasses = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

/**
 * An adaptor's square icon (collaborative-editor/components/AdaptorIcon.tsx),
 * or a grey tile with its initial when there's no icon.
 */
export default function AdaptorIcon({ name, size = "md" }: { name: string; size?: keyof typeof sizeClasses }) {
  const short = adaptorShortName(name);
  const url = adaptorIconUrl(name);
  if (!url) {
    return (
      <div className={cn(sizeClasses[size], "flex items-center justify-center rounded-md bg-gray-200 text-xs font-semibold text-gray-500")}>
        {short[0]?.toUpperCase() || "?"}
      </div>
    );
  }
  return <img src={url} alt={short} className={cn(sizeClasses[size], "object-cover")} />;
}
