import type { ReactNode } from "react";

interface Props {
  title: ReactNode;
  subtitle: ReactNode;
  /** Right-aligned action, usually a Button. */
  action?: ReactNode;
  /** When set, shows "Role based permissions: You cannot modify this project's {section}". */
  permissionsSection?: string;
}

/**
 * Heading for a settings panel (Lightning's `LayoutComponents.section_header`):
 * a title, a small gray subtitle, an optional permissions warning, and the
 * panel's main action on the right.
 */
export default function SectionHeader({ title, subtitle, action, permissionsSection }: Props) {
  return (
    <div className="flex justify-between content-center">
      <div>
        <h6 className="font-medium text-black">{title}</h6>
        <small className="block my-1 text-xs text-gray-600">{subtitle}</small>
        {permissionsSection && (
          <small className="mt-2 text-red-700">
            Role based permissions: You cannot modify this project's {permissionsSection}
          </small>
        )}
      </div>
      {action && <div className="sm:block">{action}</div>}
    </div>
  );
}
