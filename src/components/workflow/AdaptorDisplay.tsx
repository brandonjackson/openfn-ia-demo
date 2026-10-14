import { adaptorDisplayName, ADAPTORS_WITHOUT_CREDENTIALS, adaptorShortName, resolveAdaptor } from "../../mock-data/adaptors";
import { cn } from "../../utils/cn";
import Button from "../Button";
import Pill from "../Pill";
import AdaptorIcon from "./AdaptorIcon";

/** The help text on the Adaptor field label. */
export const ADAPTOR_HELP =
  "Choose an adaptor to perform operations (via helper functions) in a specific application. Pick 'http' for generic REST APIs or the 'common' adaptor if this job only performs data manipulation.";

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
  const canEdit = hasCredential || !needsCredential;
  return (
    <div className="flex items-center justify-between gap-2 w-full rounded-lg border border-slate-300 sm:text-sm sm:leading-6 p-2">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {onChangeAdaptor && !isReadOnly ? (
          <Button theme="secondary" size="sm" onClick={onChangeAdaptor} aria-label="Change adaptor" className="min-w-0 py-1 pl-1.5">
            <AdaptorIcon name={adaptor} size="sm" />
            <span className="truncate">{adaptorDisplayName(adaptor)}</span>
          </Button>
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
          <span title={credentialName} aria-label={`Credential connected: ${credentialName}`} className="min-w-0">
            <Pill color="green" className="max-w-[150px] gap-1">
              <span className="hero-key h-3 w-3 shrink-0" />
              <span className="truncate">{credentialName}</span>
            </Pill>
          </span>
        )}
      </div>
      {onEdit && !isReadOnly && (
        <Button
          theme={canEdit ? "secondary" : "primary"}
          size="sm"
          onClick={onEdit}
          aria-label={canEdit ? "Edit adaptor" : "Connect credential"}
          className="shrink-0 py-1"
        >
          {canEdit ? "Edit" : "Connect"}
        </Button>
      )}
    </div>
  );
}
