import Button from "../Button";
import ProfileCard from "./ProfileCard";

/** The last card on /profile (profile_live/components.ex `delete_user_card`). */
export default function DeleteAccountCard({ to }: { to: string }) {
  return (
    <ProfileCard annotation="profile-delete-account">
      <span className="text-xl">Delete account</span>
      <span className="float-right">
        <Button theme="danger" to={to}>
          Delete my account
        </Button>
      </span>
    </ProfileCard>
  );
}
