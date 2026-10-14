import { Navigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import AuthProviderForm from "../../components/admin/AuthProviderForm";
import { authProvider, emptyAuthProvider } from "../../mock-data/admin";

/**
 * Inventory view `admin-auth-providers` (AuthProvidersLive.Index):
 * /settings/authentication edits the configured provider (or redirects to
 * /new when there is none); /settings/authentication/new is a blank form.
 */
export default function AdminAuthProvidersPage() {
  const { pathname } = useLocation();
  const isNew = pathname.endsWith("/new");
  if (!isNew && !authProvider) return <Navigate to="/settings/authentication/new" replace />;
  const provider = isNew || !authProvider ? emptyAuthProvider : authProvider;

  return (
    <PageContent header={<Header title="Authentication" />}>
      <Centered>
        <AuthProviderForm key={provider.id ?? "new"} provider={provider} />
      </Centered>
    </PageContent>
  );
}
