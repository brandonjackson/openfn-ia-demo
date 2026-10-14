import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { User } from "../mock-data/users";
import UserAvatar from "./UserAvatar";

interface Props {
  user: User;
  /** Start open (stories and screenshots). */
  defaultOpen?: boolean;
}

const items = [
  { to: "/projects", icon: "hero-folder", label: "Projects" },
  { to: "/profile", icon: "hero-user-circle", label: "User Profile" },
  { to: "/credentials", icon: "hero-key", label: "Credentials" },
  { to: "/profile/tokens", icon: "hero-command-line", label: "API Tokens" },
];

/**
 * The account button at the top of the side menu and its dropdown
 * (Lightning's `user_menu_dropdown`): who you're signed in as, the
 * experimental-features notice, your pages, and log out.
 */
export default function UserMenu({ user, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="h-10 mx-3 flex-1 min-w-0 relative">
      <button
        type="button"
        data-ui="account-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="user-menu-trigger menu-item menu-item-inactive h-10 w-full bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium flex items-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      >
        <div className="user-menu-content flex items-center w-full min-w-0">
          <UserAvatar firstName={user.firstName} lastName={user.lastName} className="shrink-0" />
          <div className="min-w-0 overflow-hidden flex-1 user-menu-text">
            <div className="text-sm font-medium text-white truncate">
              {user.firstName}
              {user.lastName ? " " + user.lastName : ""}
            </div>
          </div>
          <span className="hero-chevron-down w-4 h-4 text-white/70 shrink-0 user-menu-chevron" />
        </div>
      </button>
      {open && (
        <div
          className="fixed z-[9999] mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg outline-1 outline-black/5"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-4 py-3">
            <p className="text-sm text-gray-700">Signed in as</p>
            <p className="truncate text-sm font-medium text-gray-900">{user.email}</p>
          </div>
          {user.experimentalFeatures && (
            <div className="px-4 py-3 bg-amber-50">
              <p className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                <span className="hero-wrench-screwdriver-mini h-4 w-4 text-amber-600" /> Experimental features on
              </p>
              <p className="mt-0.5 text-xs text-gray-600">
                You're using features that are still being built. Things may work differently for you than for your
                teammates.
              </p>
              <p className="mt-1.5 text-xs">
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="font-medium text-amber-700 underline underline-offset-2"
                >
                  Turn off in your profile
                </Link>
              </p>
            </div>
          )}
          <div className="py-1">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <span className={`${item.icon} h-5 w-5 inline-block mr-2`} /> {item.label}
              </Link>
            ))}
          </div>
          <div className="py-1">
            <Link
              to="/users/log_in"
              role="menuitem"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              Log out
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
