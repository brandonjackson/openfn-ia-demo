import type { User } from "../../mock-data/users";
import Menu, { MenuDivider, MenuHeader, MenuItem } from "../Menu";
import UserAvatar from "../UserAvatar";

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
export default function UserMenu({ user }: { user: User }) {
  return (
    <div className="mx-3 min-w-0 flex-1">
      <Menu
        align="start"
        trigger={
          <button
            type="button"
            data-ui="account-trigger"
            className="user-menu-trigger flex h-10 w-full items-center rounded-lg bg-white/10 text-sm font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <div className="user-menu-content flex w-full min-w-0 items-center">
              <UserAvatar firstName={user.firstName} lastName={user.lastName} className="shrink-0" />
              <span className="user-menu-text min-w-0 flex-1 truncate text-left">
                {user.firstName}
                {user.lastName ? " " + user.lastName : ""}
              </span>
              <span className="user-menu-chevron hero-chevron-down h-4 w-4 shrink-0 text-white/70" />
            </div>
          </button>
        }
      >
        <MenuHeader>
          <p className="text-gray-700">Signed in as</p>
          <p className="truncate font-medium text-gray-900">{user.email}</p>
        </MenuHeader>
        {user.experimentalFeatures && (
          <MenuItem
            to="/profile"
            icon="hero-wrench-screwdriver-mini"
            description="You're using features that are still being built. Things may work differently for you than for your teammates. Turn off in your profile."
          >
            Experimental features on
          </MenuItem>
        )}
        <MenuDivider />
        {items.map((item) => (
          <MenuItem key={item.to} to={item.to} icon={item.icon}>
            {item.label}
          </MenuItem>
        ))}
        <MenuDivider />
        <MenuItem to="/users/log_in">Log out</MenuItem>
      </Menu>
    </div>
  );
}
