import DateTime from "../DateTime";
import Heading from "../Heading";
import type { User } from "../../types/users";

/** Left column of /profile (profile_live/components.ex `user_info`). */
export default function UserInfo({ user }: { user: User }) {
  return (
    <div className="space-y-1 text-sm leading-6 text-gray-600">
      <Heading as="h2">
        {user.firstName} {user.lastName}
      </Heading>
      <p>Change name, email, password, and request deletion.</p>
      <hr className="my-6 border-gray-200" />
      <p>
        Created: <DateTime value={user.insertedAt} />
      </p>
      <p>Email: {user.email}</p>
    </div>
  );
}
