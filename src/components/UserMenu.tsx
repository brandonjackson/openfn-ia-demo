import type { User } from "../mock-data/users";
import Menu, { MenuDivider, MenuHeader, MenuItem } from "./Menu";
import UserAvatar from "./UserAvatar";

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
    <div className="h-10 mx-3 flex-1 min-w-0">
      <Menu
        align="start"
        trigger={
          <button
            type="button"
            data-ui="account-trigger"
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
