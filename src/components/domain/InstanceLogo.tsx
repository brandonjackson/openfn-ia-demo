import Link from "../primitives/Link";

interface Props {
  /** The instance you're signed in to. */
  instance: { name: string; initials: string };
}

/**
 * The instance's initials tile and name, linking back to Overview. Tops the
 * sidebar and, on small screens, the mobile top bar.
 */
export default function InstanceLogo({ instance }: Props) {
  return (
    <Link to="/" className="flex items-center gap-2" title="Back to Overview">
      <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
        <span className="text-white text-xs font-bold">{instance.initials}</span>
      </div>
      <span className="text-lg font-semibold text-gray-900">{instance.name}</span>
    </Link>
  );
}
