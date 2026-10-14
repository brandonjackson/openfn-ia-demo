import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import UserDeletionModal from "../../components/admin/UserDeletionModal";
import UsersTable from "../../components/admin/UsersTable";
import { findUser, users } from "../../mock-data/users";

/** Inventory view `admin-users` (UserLive.Index): /settings/users and /settings/users/:userId/delete. */
export default function AdminUsersPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const deleteUser = userId ? findUser(userId) : undefined;
  const close = () => navigate("/settings/users");

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
        {deleteUser && <UserDeletionModal key={deleteUser.id} onClose={close} onDelete={close} />}
        <UsersTable users={users} />
      </Centered>
    </PageContent>
  );
}
