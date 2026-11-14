import { Building2, ChevronsUpDown, LogOut, Settings, ShieldCheck } from "lucide-react";
import Surface from "../primitives/Surface";
import { usePopover } from "../primitives/use-popover";
import NavItem from "../primitives/NavItem";
import InstanceMark from "./InstanceMark";

interface Props {
  user: { firstName: string; lastName: string; email: string };
  /** The organisation you're in or, without Organizations, the instance: its name, and its logo (or initials), the same mark as the sidebar's corner. */
  instance: { name: string; initials: string; logo?: string };
  /** Offer Organization settings. Off when the demo's Organizations flag is. */
  showOrganizationSettings?: boolean;
  /** Offer Admin settings, the whole instance's. Only for a superuser. */
  showAdminSettings?: boolean;
  /** Called when "Log out" is chosen. */
  onLogOut?: () => void;
  /** Start with the menu open (useful for stories and screenshots). */
  defaultOpen?: boolean;
}

/**
 * Account switcher pinned to the bottom of the sidebar. Shows who you are
 * and which organisation you're in; opens upwards into your personal and
 * organisation settings, and, for a superuser, the instance's admin settings.
 */
export default function AccountMenu({
  user,
  instance,
  showOrganizationSettings = true,
  showAdminSettings = false,
  onLogOut,
  defaultOpen = false,
}: Props) {
  const { open, setOpen, ref } = usePopover(defaultOpen);
  const close = () => setOpen(false);


  return (
    <div ref={ref} className="relative">
      {open && (
        <Surface
          variant="popover"
          role="menu"
          data-ui="popover"
          className="absolute bottom-full left-0 right-0 mb-2 p-1.5"
        >
          <p className="truncate px-2 pt-1 pb-1.5 text-xs text-gray-500">{user.email}</p>
          <NavItem variant="menu" to="/user-settings" icon={Settings} label="Settings" onClick={close} />
          {showOrganizationSettings && (
            <NavItem
              variant="menu"
              to="/organization-settings"
              icon={Building2}
              label="Organization settings"
              onClick={close}
            />
          )}
          {showAdminSettings && (
            <NavItem variant="menu" to="/admin-settings" icon={ShieldCheck} label="Admin settings" onClick={close} />
          )}
          <div className="my-1.5 border-t border-gray-200" />
          <NavItem
            variant="menu"
            icon={LogOut}
            label="Log out"
            onClick={() => {
              close();
              onLogOut?.();
            }}
          />
        </Surface>
      )}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        data-ui="account-trigger"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${
          open ? "bg-gray-100" : "hover:bg-gray-100"
        }`}
      >
        <InstanceMark instance={instance} />
        <span className="min-w-0 flex-1 truncate text-sm">
          <span className="font-medium text-gray-900">{user.firstName}</span>
          <span className="text-gray-500"> · {instance.name}</span>
        </span>
        <ChevronsUpDown size={14} className="flex-shrink-0 text-gray-400" />
      </button>
    </div>
  );
}
