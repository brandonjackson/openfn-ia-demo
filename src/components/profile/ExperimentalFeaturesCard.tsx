import Toggle from "../Toggle";
import ProfileCard from "./ProfileCard";

/** The Experimental Features card on /profile (experimental_features_component.html.heex). */
export default function ExperimentalFeaturesCard({ enabled, onChange }: { enabled: boolean; onChange?: (enabled: boolean) => void }) {
  return (
    <ProfileCard
      annotation="profile-experimental-features"
      title="Experimental Features"
      description="Enable access to new features and improvements before they're generally available"
      action={<Toggle checked={enabled} onChange={onChange} />}
    />
  );
}
