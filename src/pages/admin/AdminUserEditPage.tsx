import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import UserForm from "../../components/admin/UserForm";
import { findUser } from "../../mock-data/users";

/** Inventory view `admin-user-edit` (UserLive.Edit): /settings/users/new and /settings/users/:userId. */
export default function AdminUserEditPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const user = userId ? findUser(userId) : undefined;
  const title = user ? "Edit User" : "New User";

  return (
    <PageContent header={<Header title={title} />}>
      <Centered>
        <UserForm key={user?.id ?? "new"} user={user} onSave={() => navigate("/settings/users")} />
      </Centered>
    </PageContent>
  );
}
