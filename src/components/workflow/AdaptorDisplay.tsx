import { adaptorDisplayName, ADAPTORS_WITHOUT_CREDENTIALS, adaptorShortName, resolveAdaptor } from "../../mock-data/adaptors";
import { cn } from "../../utils/cn";
import AdaptorIcon from "./AdaptorIcon";

interface Props {
  adaptor: string;
  credentialName?: string | null;
  onEdit?: () => void;
  onChangeAdaptor?: () => void;
  isReadOnly?: boolean;
}

/**
 * The adaptor row in the job inspector and IDE header (AdaptorDisplay.tsx at
 * size "sm"): the adaptor button with its icon, the version, a green key pill
 * when a credential is connected, and Edit (or Connect when one is needed).
 */
export default function AdaptorDisplay({ adaptor, credentialName = null, onEdit, onChangeAdaptor, isReadOnly = false }: Props) {
  const { version } = resolveAdaptor(adaptor);
  const needsCredential = !ADAPTORS_WITHOUT_CREDENTIALS.includes(adaptorShortName(adaptor));
  const hasCredential = !!credentialName;
  return (
    <div className="flex items-center justify-between gap-2 w-full rounded-lg border border-slate-300 sm:text-sm sm:leading-6 p-2">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {onChangeAdaptor && !isReadOnly ? (
          <button
            type="button"
            onClick={onChangeAdaptor}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 h-7 border border-gray-300 bg-white rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
            aria-label="Change adaptor"
          >
            <AdaptorIcon name={adaptor} size="sm" />
            <span className="font-medium text-gray-900 truncate text-sm">{adaptorDisplayName(adaptor)}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 opacity-50">
            <AdaptorIcon name={adaptor} size="sm" />
            <span className="font-medium text-gray-500 truncate text-sm">{adaptorDisplayName(adaptor)}</span>
          </div>
        )}
        <span className={cn("text-xs whitespace-nowrap", isReadOnly ? "text-gray-400" : "text-gray-500")}>
          {version === "latest" ? "latest" : `v${version}`}
        </span>
        {hasCredential && (
          <span
            title={credentialName}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 flex-shrink-0 max-w-[150px]"
            aria-label={`Credential connected: ${credentialName}`}
          >
            <span className="hero-key h-3 w-3 flex-shrink-0" />
            <span className="text-xs font-medium truncate">{credentialName}</span>
          </span>
        )}
      </div>
      {onEdit && !isReadOnly && (
        <button
          type="button"
          onClick={onEdit}
          className={cn(
            "px-2.5 py-1 h-7 rounded-md font-medium focus:outline-none flex-shrink-0 transition-colors relative text-sm",
            hasCredential || !needsCredential
              ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              : "bg-primary-600 hover:bg-primary-500 text-white shadow-xs"
          )}
          aria-label={hasCredential || !needsCredential ? "Edit adaptor" : "Connect credential"}
        >
          {hasCredential || !needsCredential ? "Edit" : "Connect"}
        </button>
      )}
    </div>
  );
}
