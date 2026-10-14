import { adaptorIconUrl, adaptorShortName } from "../../mock-data/adaptors";

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
      <div className={`${sizeClasses[size]} rounded-md bg-gray-200 flex items-center justify-center`}>
        <span className="text-xs font-semibold text-gray-500">{short[0]?.toUpperCase() || "?"}</span>
      </div>
    );
  }
  return <img src={url} alt={short} className={`${sizeClasses[size]} object-cover`} />;
}
