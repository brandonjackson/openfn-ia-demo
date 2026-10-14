import Toggle from "../Toggle";
import ProfileCard, { ProfileCardHeading } from "./ProfileCard";

/** The Experimental Features card on /profile (experimental_features_component.html.heex). */
export default function ExperimentalFeaturesCard({ enabled, onChange }: { enabled: boolean; onChange?: (enabled: boolean) => void }) {
  return (
    <ProfileCard annotation="profile-experimental-features">
      <div className="flex items-center justify-between">
        <ProfileCardHeading
          title="Experimental Features"
          description="Enable access to new features and improvements before they're generally available"
        />
        <form className="ml-5" onSubmit={(e) => e.preventDefault()}>
          <Toggle checked={enabled} onChange={onChange} />
        </form>
      </div>
    </ProfileCard>
  );
}
