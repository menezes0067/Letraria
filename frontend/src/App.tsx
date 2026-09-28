import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";

import { LibraryProvider, useLibrary } from "./lib/library";
import { AppShell } from "./layout/shell";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Dashboard } from "./pages/dashboard";
import { CatalogPage } from "./pages/catalog";
import { LoansPage } from "./pages/loans";
import { UsersPage } from "./pages/users";
import type { UserProfile } from "./types";

function Protected({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useLibrary();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireProfile({
  profile,
  children,
}: {
  profile: UserProfile;
  children: ReactNode;
}) {
  const { currentUser, loading } = useLibrary();
  if (loading) return null;
  if (currentUser?.profile !== profile) return <Navigate to="/app/inicio" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <LibraryProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route
          path="/app"
          element={
            <Protected>
              <AppShell />
            </Protected>
          }
        >
          <Route index element={<Navigate to="/app/inicio" replace />} />
          <Route path="inicio" element={<Dashboard />} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="emprestimos" element={<LoansPage />} />
          <Route
            path="leitores"
            element={
              <RequireProfile profile="bibliotecario">
                <UsersPage />
              </RequireProfile>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LibraryProvider>
  );
}