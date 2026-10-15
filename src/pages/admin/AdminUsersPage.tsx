import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import UserDeletionModal from "../../components/admin/UserDeletionModal";
import UsersTable from "../../components/admin/UsersTable";
import { useToast } from "../../components/Toast";
import { findUser, users } from "../../mock-data/users";

/** Inventory view `admin-users` (UserLive.Index): /settings/users and /settings/users/:userId/delete. */
export default function AdminUsersPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const deleteUser = userId ? findUser(userId) : undefined;
  const close = () => navigate("/settings/users");
  const toast = useToast();

  return (
    <PageContent
      header={
        <Header title="Users">
          <Button to="/settings/users/new">
            <span className="hero-plus-solid h-4 w-4" />
            New User
          </Button>
        </Header>
      }
    >
      <Centered>
        {deleteUser && (
          <UserDeletionModal
            key={deleteUser.id}
            onClose={close}
            onDelete={() => {
              // user_deletion_modal.ex: the first delete schedules it; deleting a scheduled user is final.
              toast(deleteUser.scheduledDeletion ? "User deleted" : "User scheduled for deletion");
              close();
            }}
          />
        )}
        <UsersTable users={users} onCancelDeletion={() => toast("User deletion canceled")} />
      </Centered>
    </PageContent>
  );
}
