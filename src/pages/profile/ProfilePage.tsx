import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import UserInfo from "../../components/profile/UserInfo";
import { BasicInfoForm, ChangeEmailForm, ChangePasswordForm } from "../../components/profile/ProfileForms";
import MfaCard from "../../components/profile/MfaCard";
import GithubCard from "../../components/profile/GithubCard";
import ExperimentalFeaturesCard from "../../components/profile/ExperimentalFeaturesCard";
import DeleteAccountCard from "../../components/profile/DeleteAccountCard";
import UserDeletionModal from "../../components/admin/UserDeletionModal";
import { currentUser } from "../../mock-data/users";
import { githubOauthEnabled, hasActivityInProjects } from "../../mock-data/profile";

/**
 * Inventory views `profile-account`, `profile-mfa`, `profile-github`,
 * `profile-experimental-features` and `profile-delete-account`
 * (profile_live/edit.html.heex): user info on the left, the cards on the right.
 * /profile/:userId/delete opens the delete account modal over the page.
 */
export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(currentUser);
  // Lightning only lets you delete your own account here (Policies.Users :delete_account).
  const deleting = userId !== undefined && userId === user.id;

  return (
    <PageContent header={<Header title="User Profile" />}>
      <Centered>
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <UserInfo user={user} />
          <div id={`user-${user.id}`} className="md:col-span-2">
            {deleting && (
              <UserDeletionModal
                isCurrentUser
                hasActivityInProjects={hasActivityInProjects}
                blocked={!!user.scheduledDeletion && hasActivityInProjects}
                onClose={() => navigate("/profile")}
                onDelete={() => navigate("/profile")}
              />
            )}
            <BasicInfoForm user={user} onSave={(changes) => setUser((u) => ({ ...u, ...changes }))} />
            <ChangeEmailForm />
            <ChangePasswordForm />
            <MfaCard mfaEnabled={user.mfaEnabled} onChange={(mfaEnabled) => setUser((u) => ({ ...u, mfaEnabled }))} />
            <GithubCard
              oauthEnabled={githubOauthEnabled}
              connected={user.githubConnected}
              onDisconnect={() => setUser((u) => ({ ...u, githubConnected: false }))}
            />
            <ExperimentalFeaturesCard
              enabled={user.experimentalFeatures}
              onChange={(experimentalFeatures) => setUser((u) => ({ ...u, experimentalFeatures }))}
            />
            <DeleteAccountCard to={`/profile/${user.id}/delete`} />
          </div>
        </div>
      </Centered>
    </PageContent>
  );
}
