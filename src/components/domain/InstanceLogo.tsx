import Link from "../primitives/Link";

interface Props {
  /** Whose corner it is: the organisation you're in or, without Organizations, the instance you're signed in to. Its logo (a URL or data URL) shows when it has one, its initials otherwise. */
  instance: { name: string; initials: string; logo?: string };
  /** The tooltip saying where it goes: Overview, or the projects list when there's no organization layer. */
  title?: string;
}

/**
 * The organisation's logo (or its initials, without one) and its name,
 * linking back home (Overview, or the projects list). Without Organizations
 * it's the instance's. Tops the sidebar and, on small screens, the mobile
 * top bar.
 */
export default function InstanceLogo({ instance, title = "Back to Overview" }: Props) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2" title={title}>
      {instance.logo ? (
        <img src={instance.logo} alt="" className="h-7 w-7 flex-shrink-0 rounded-md border border-gray-200 bg-white object-contain" />
      ) : (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">{instance.initials}</div>
      )}
      <span className="truncate text-lg font-semibold text-gray-900">{instance.name}</span>
    </Link>
  );
}
