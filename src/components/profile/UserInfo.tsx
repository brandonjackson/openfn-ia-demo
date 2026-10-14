import RelativeTime from "../projects/RelativeTime";
import type { User } from "../../mock-data/users";

/** Left column of /profile (profile_live/components.ex `user_info`). */
export default function UserInfo({ user }: { user: User }) {
  return (
    <div className="px-4 sm:px-0">
      <h2 className="text-base font-semibold leading-7 text-gray-900">
        {user.firstName} {user.lastName}
      </h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">Change name, email, password, and request deletion.</p>
      <div className="border-b border-gray-900/10 mt-6 mb-6" />
      <p className="mt-1 text-sm leading-6 text-gray-600">
        Created: <RelativeTime datetime={user.insertedAt} />
      </p>
      <p className="mt-1 text-sm leading-6 text-gray-600">Email: {user.email}</p>
    </div>
  );
}
